import React from 'react';
import {
  Platform
} from 'react-native';

import SQLite from "react-native-sqlite-2";

import MetaStorage from 'src/singletons/MetaStorage';

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
    const asub = "asub TEXT";
    const amsg = "amsg TEXT NOT NULL";
    const acta = "acta TEXT";
    const aimg = "aimg TEXT";
    const hidden = "hidden BOOL";
    const epoch = "epoch INTEGER";

    const dropTable = `DROP TABLE IF EXISTS ${table}`;
    const createTable = `CREATE TABLE IF NOT EXISTS ${table} (${nid}, ${type}, ${app}, ${icon}, ${url}, ${appbot}, ${secret}, ${asub}, ${amsg}, ${acta}, ${aimg}, ${hidden}, ${epoch})`;

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
    const statement = `SELECT * FROM ${table} WHERE hidden=FALSE LIMIT ${startIndex}, ${numRows}`;
    db.transaction(function(txn) {
      txn.executeSql(statement, [], function(tx, res) {
        console.log(res);
        console.log("rese");
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
            asub: feedItem.asub,
            amsg: feedItem.amsg,
            acta: feedItem.acta,
            aimg: feedItem.aimg,
            timeInEpoch: feedItem.epoch,
          };

          response.push(obj);
        }
      });
    });

    return response;
  },
  // To Add Feed coming from Notification or Appbot
  addFeedFromPayload: function(typeV, appV, iconV, urlV, appbotV, secretV, asubV, amsgV, actaV, aimgV, epochV) {
    FeedDBHelper.addRawFeed(typeV, appV, iconV, urlV, appbotV, secretV,  asubV, amsgV, actaV, aimgV, false, epochV);
  },
  // To Add Raw Feed
  addRawFeed: async function(typeV, appV, iconV, appbotV, secretV, asubV, amsgV, actaV, aimgV, hiddenV, epochV) {
    const db = FeedDBHelper.getDB();
    const table = FeedDBHelper.getTable();

    // prepare
    const type = "type";
    const app = "app";
    const icon = "icon";
    const url = "url";
    const appbot = "appbot";
    const secret = "secret";
    const asub = "asub";
    const amsg = "amsg";
    const acta = "acta";
    const aimg = "aimg";
    const hidden = "hidden";
    const epoch = "epoch";

    const insertRows = `${type}, ${app}, ${icon}, ${url}, ${appbot}, ${secret}, ${asub}, ${amsg}, ${acta}, ${aimg}, ${hidden}, ${epoch}`;

    const statement = `INSERT INTO ${table} (${insertRows}) VALUES (${typeV}, ${appV}, ${iconV}, ${urlV}, ${appbotV}, ${secretV}, ${asubV}, ${amsgV}, ${actaV}, ${aimgV}, ${hiddenV}, ${epochV})`;

    db.transaction(function(txn) {
      txn.executeSql(statement, []);
    });

    // Finally update badge
    const currentBadge = await MetaStorage.getBadgeCount();
    await MetaStorage.setBadgeCount(currentBadge + 1);
  },
  // To Create Feed Internal Payload
  createFeedInternalPayload: function(type, name, icon, url, appbot, secret, sub, msg, cta, img, epoch) {
    // Prepare msg data first

    // Then prepare payload
    const payload = {
      type: type,
      app: name,
      icon: icon,
      url: url,
      appbot: appbot,
      secret: secret,
      sub: sub,
      msg: msg,
      cta: cta,
      img: img,
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
      payload.asub,
      payload.amsg,
      payload.aimg,
      payload.acta,
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
