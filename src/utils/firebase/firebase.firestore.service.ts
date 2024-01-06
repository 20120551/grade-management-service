import { Inject, Injectable } from '@nestjs/common';
import { FirebaseModuleOptions } from '.';
import { initializeApp } from 'firebase-admin/app';
import {
  Filter,
  Firestore,
  QueryDocumentSnapshot,
  getFirestore,
} from 'firebase-admin/firestore';
import { flatten, isEmpty, isObject } from 'lodash';
import BPromise from 'bluebird';
import { v4 as uuid } from 'uuid';
import { credential } from 'firebase-admin';
import { credential as firebaseCredential } from './credential';

export const IFirebaseFireStoreService = 'IFirebaseFireStoreService';

export type FireStoreOperation = {
  neq?: boolean | string | number;
  eq?: boolean | string | number;
  lt?: string | number;
  lte?: string | number;
  gt?: string | number;
  gte?: string | number;
};

export type FireStoreOperationCondition = Record<string, FireStoreOperation>;

export type FireStoreQueryCondition =
  | FireStoreOperationCondition
  | {
      and?: FireStoreOperationCondition[];
      or?: FireStoreOperationCondition[];
    };

export type FireStoreQuery = {
  select?: Record<string, FireStoreQuery | true>;
  set?: object;
  where?: FireStoreQueryCondition;
};

export interface IFirebaseFireStoreService {
  get<T extends Record<string, any>>(
    collection: string,
    query?: FireStoreQuery,
  ): Promise<T[]>;
  create<T extends Record<string, any>>(
    collection: string,
    data: T,
  ): Promise<{ id: string } & T>;
  update<T, R extends Record<string, any>>(
    collection: string,
    data: T,
    query?: FireStoreQuery,
  ): Promise<R[]>;
  del<T extends Record<string, any>>(
    collection: string,
    query?: FireStoreQuery,
  ): Promise<T[]>;
}

/**
 * Table notification {
      notification_id UUID [primary key]
      sender_id UUID
      content text
      channel $join(uniqueId, event)
      type enum
      redirect_endpoint text
    }
 */

// https://blog.logrocket.com/push-notifications-react-firebase/
// https://firebase.google.com/docs/firestore/quickstart
// https://docs.google.com/spreadsheets/d/1PmHBquVfjnAeWI2vyz_uOdks9lJgqmcvmVx1VY_XTdE/edit#gid=0

@Injectable()
export class FirebaseFireStoreService implements IFirebaseFireStoreService {
  private readonly _fireStore: Firestore;
  constructor(
    @Inject(FirebaseModuleOptions)
    options: FirebaseModuleOptions,
  ) {
    initializeApp({
      credential: credential.cert(firebaseCredential),
    });
    this._fireStore = getFirestore();
  }

  async get<T extends Record<string, any>>(
    collection: string,
    query?: FireStoreQuery,
  ): Promise<T[]> {
    const ref = this._getRef(collection, query);
    const doc = await ref.get();
    if (doc.empty) {
      return [];
    }
    return this._selectData<T>(doc.docs);
  }

  async create<T extends Record<string, any>>(
    collection: string,
    data: T,
  ): Promise<{ id: string } & T> {
    const _ref = this._fireStore.collection(collection);
    const id = uuid();
    await _ref.doc().create({
      id,
      ...data,
    });

    return { id, ...data };
  }
  async update<T, R extends Record<string, any>>(
    collection: string,
    data: T,
    query?: FireStoreQuery,
  ): Promise<R[]> {
    const ref = this._getRef(collection, query);
    const doc = await ref.get();
    if (doc.empty) {
      return [];
    }

    const updatedDocs = await BPromise.map(doc.docs, async (doc) =>
      doc.ref.set(data),
    );

    console.info(
      updatedDocs.map((updatedDoc) => updatedDoc.writeTime.valueOf()),
    );
    return this._selectData<R>(doc.docs);
  }

  async del<T extends Record<string, any>>(
    collection: string,
    query?: FireStoreQuery,
  ): Promise<T[]> {
    const ref = this._getRef(collection, query);
    const doc = await ref.get();
    if (doc.empty) {
      throw new Error('Not found entry');
    }

    const deletedDocs = await BPromise.map(doc.docs, async (doc) =>
      doc.ref.delete(),
    );

    console.info(
      deletedDocs.map((updatedDoc) => updatedDoc.writeTime.valueOf()),
    );

    return this._selectData<T>(doc.docs);
  }

  private _selectData<T extends Record<string, any>>(
    docs: QueryDocumentSnapshot[],
  ) {
    return docs.map((doc) => doc.data() as T);
  }

  private _getRef(collection: string, query: FireStoreQuery) {
    let collectionRef = this._fireStore.collection(collection);

    const extractedCondition = this._extractWhereQuery(query.where);
    if (isEmpty(extractedCondition)) {
      return collectionRef;
    }

    const attachConditionToRef = (condition: any) => {
      if (condition === 'and' || condition === 'or') {
        Filter[condition](
          condition.map((subCondition) => attachConditionToRef(subCondition)),
        );
      } else {
        const [arg1, operation, arg2] = condition;
        return Filter.where(arg1, operation, arg2);
      }
    };

    return collectionRef.where(
      Filter.and(
        ...extractedCondition.map((condition) =>
          attachConditionToRef(condition),
        ),
      ),
    );
  }

  private _extractSelectQuery({ select }: FireStoreQuery): any[] {
    if (isEmpty(select) || !isObject(select)) {
      return [];
    }

    const keys = Object.keys(select);
    const result = keys.map((key) => {
      if (select[key] === true) {
        return key;
      }
      return [
        key,
        this._extractSelectQuery(select[key] as FireStoreQuery).filter(Boolean),
      ];
    });
    return result;
  }

  private _extractWhereQuery(where: FireStoreQueryCondition): any[] {
    if (isEmpty(where) || !isObject(where)) {
      return [];
    }

    const keys = Object.keys(where);
    const result = keys.map((key) => {
      if (key === 'and' || key === 'or') {
        return [
          key,
          (where[key] as FireStoreOperationCondition[]).flatMap((_key) =>
            this._extractWhereQuery(_key),
          ),
        ];
      } else {
        const result = [];
        const data = where[key] as FireStoreOperation;
        if (data.eq) {
          result.push([key, '==', data.eq]);
        }
        if (data.neq) {
          result.push([key, '!=', data.neq]);
        }
        if (data.lt) {
          result.push([key, '<', data.lt]);
        }
        if (data.lte) {
          result.push([key, '<=', data.lte]);
        }
        if (data.gt) {
          result.push([key, '>', data.gt]);
        }
        if (data.gte) {
          result.push([key, '>=', data.gte]);
        }

        return flatten(result);
      }
    });
    return result;
  }
}
