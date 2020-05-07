import React from 'react';
import {
  Platform
} from 'react-native';

import SQLite from "react-native-sqlite-2";

import CryptoHelper from 'src/helpers/CryptoHelper';

import GLOBALS from 'src/Globals';

// FeedDB Helper Function
const FeedDBHelper = {
  // To Get DB Connection
  getDB: function () {
    const db = SQLite.openDatabase("feedDB.sqlite", "1.0", "", 1);
    return db;
  },
  // To Get the table name
  getTable: function() {
    const tableName = "feed";
    return tableName;
  },
  // To Create Table, can also be used to purge
  createTable: function () {
    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    // Prepare statement
    const nid = "nid INTEGER PRIMARY KEY NOT NULL";
    const type = "type INTEGER NOT NULL";
    const app = "app VARCHAR(40) NOT NULL";
    const icon = "icon TEXT NOT NULL";
    const url = "url TEXT NOT NULL";
    const appbot = "appbot BOOL";
    const secret = "secret TEXT";
    const msgdata = "msgdata TEXT NOT NULL";
    const hidden = "hidden BOOL";
    const epoch = "epoch INTEGER";

    const dropTable = `DROP TABLE IF EXISTS ${table}`;
    const createTable = `CREATE TABLE IF NOT EXISTS ${table} (${nid}, ${type}, ${app}, ${icon}, ${url}, ${appbot}, ${secret} ${msgdata}, ${hidden}, ${epoch})`;

    db.transaction(function(txn) {
      txn.executeSql(dropTable, []);
      txn.executeSql(createTable, []);
    });
  },
  // To get Feeds, return Object of Objects
  getFeeds: function(startIndex, numRows) {
    // RETURN ARRAY OF OBJECTS (JSON) or empty array if no feed remaining
    // JSON FORMAT OF OBJECT
    // {
    //   notificationID: String
    //   notificationType: Integer (1 - normal notification, 2 - encrypted)
    //   appName: String
    //   appIcon: String
    //   appURL: String
    //   appbot: Bool
    //   secret: String (is the encrypted secret that needs to be used to decrypt msgData if notification type is 2)
    //   msgData: JSON String, can be encrypted or unencrpyted as per notificationType
    //   timeInEpoch: Integer
    // }

    const endIndex = startIndex + numRows;

    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    let response = [];

    // Prepare statement
    const statement = `SELECT * FROM ${table} WHERE HIDDEN=FALSE LIMIT ${startIndex}, ${numRows}`;
    txn.executeSql(statement, [], function(tx, res) {
      for (let i = 0; i < res.rows.length; ++i) {
        const feedItem = res.rows.item(i);
        console.log("item: ", feedItem);

        // Create object
        let obj = {
          notificationID: feedItem.nid,
          notificationType: feedItem.type,
          appName: feedItem.app,
          appIcon: feedItem.icon,
          appURL: feedItem.url,
          appbot: feedItem.appbot,
          secret: feedItem.secret,
          msgData: feedItem.msgdata,
          timeInEpoch: feedItem.epoch,
        };

        response.push(obj);
      }
    });

    return response;
  },
  // To Add Feed coming from Notification or Appbot
  addFeedFromPayload: function(typeVal, appVal, iconVal, urlVal, appbotVal, secretVal, msgdataVal, epochVal) {
    FeedDBHelper.addRawFeed(typeVal, appVal, iconVal, urlVal, appbotVal, secretVal, msgdataVal, false, epochVal);
  },
  // To Add Raw Feed
  addRawFeed: function(typeV, appV, iconV, appbotV, secretV, msgdataV, hiddenV, epochV) {
    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    // prepare
    const type = "type";
    const app = "app";
    const icon = "icon";
    const url = "url";
    const appbot = "appbot";
    const secret = "secret";
    const msgdata = "msgdata";
    const hidden = "hidden";
    const epoch = "epoch";

    const insertRows = `${type}, ${app}, ${icon}, ${url}, ${appbot}, ${secret}, ${msgdata}, ${hidden}, ${epoch}`;

    const statement = `INSERT INTO ${table} (${insertRows}) VALUES (${typeV}, ${appV}, ${iconV}, ${urlV}, ${appbotV}, ${secretV}, ${msgdataV}, ${hiddenV}, ${epochV})`;

    db.transaction(function(txn) {
      txn.executeSql(statement, []);
    });
  },
  // To Create Feed Internal Payload
  createFeedInternalPayload: function(type, name, icon, url, appbot, secret, sub, msg, cta, img, epoch) {
    // Prepare msg data first
    const msgPayload = {
      sub: sub,
      msg: msg,
      cta: cta,
      img: img,
    };

    let msgdata = JSON.stringify(msgPayload);
    if (type == 2) {
      // Message is aes encrypted
      msgdata = CryptoHelper.encryptWithAES(msgdata);
    }

    // Then prepare payload
    const payload = {
      type: type,
      app: name,
      icon: icon,
      url: url,
      appbot: appbot,
      secret: secret,
      msgdata: msgdata,
      hidden: false,
      epoch: epoch,
    };

    return payload;
  },
  // To add Feed from Internal Payload
  addFeedFromInternalPayload: function(payload) {
    FeedDBHelper.addRawFeed(
      payload.type,
      payload.app,
      payload.icon,
      payload.url,
      payload.appbot,
      payload.secret,
      payload.msgdata,
      payload.hidden,
      payload.epoch,
    );
  },
  hideFeed: function(nid) {
    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    // prepare
    const statement = `UPDATE ${table} SET hidden=TRUE WHERE nid=${nid}`;

    db.transaction(function(txn) {
      txn.executeSql(statement, []);
    });
  },
  unhideAllFeeds: function() {
    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    // prepare
    const statement = `UPDATE ${table} SET hidden=FALSE WHERE hidden=TRUE`;

    db.transaction(function(txn) {
      txn.executeSql(statement, []);
    });
  },
  deleteFeed: function(nid) {
    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    // prepare
    const statement = `DELETE FROM ${table} WHERE nid=${nid}`;
    txn.executeSql(statement);
  },
  createDummyFeed: function() {

  }
}

export default FeedDBHelper;
