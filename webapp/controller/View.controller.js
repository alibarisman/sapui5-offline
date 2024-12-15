sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, formatter, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("com.socar.OfflineApp.controller.View", {
		formatter: formatter,
		/* global Offline:true */
		onInit: function() {
			let uiModel = new sap.ui.model.json.JSONModel({
				"ConnectionStatu": true,
				"ConnectionStatuText": "Online",
				"ConnectionStatuIcon": "sap-icon://sys-enter-2",
				"ConnectionStatuState": "Success",
				"UnsynchronizedCount": 7
			});

			this.getView().setModel(uiModel, "ui");

			setInterval(() => {
				var conn = Offline.check();
				if (Offline.state === "up") {
					uiModel.setProperty("/ConnectionStatuText", "Online");
					uiModel.setProperty("/ConnectionStatuIcon", "sap-icon://sys-enter-2");
					uiModel.setProperty("/ConnectionStatuState", "Success");
				} else if (Offline.state === "down") {
					uiModel.setProperty("/ConnectionStatuText", "Offline");
					uiModel.setProperty("/ConnectionStatuIcon", "sap-icon://sys-cancel-2");
					uiModel.setProperty("/ConnectionStatuState", "Error");
				}

				uiModel.refresh();
			}, 2000);
		},

		openDatabase: function() {
			return new Promise((resolve, reject) => {
				const request = window.indexedDB.open("OfflineDatabase", 1); // Veritabanı adı ve sürümü

				request.onerror = (event) => {
					// MessageToast.show("Database error:", event.target.error);
					reject(event.target.error);
				};

				request.onsuccess = (event) => {
					// MessageToast.show("Database opened successfully.");
					resolve(event.target.result);
				};

				request.onupgradeneeded = (event) => {
					const db = event.target.result;
					// Bir ObjectStore oluşturun
					if (!db.objectStoreNames.contains("users")) {
						db.createObjectStore("users", {
							keyPath: "id",
							autoIncrement: true
						});
					}
				};
			});
		},

		addData: function(db, data) {
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(["users"], "readwrite");
				const objectStore = transaction.objectStore("users");

				const request = objectStore.add(data);

				request.onsuccess = () => {
					// console.log("Data added successfully.");
					resolve();
				};

				request.onerror = (event) => {
					// console.error("Error adding data:", event.target.error);
					reject(event.target.error);
				};
			});
		},

		onAddData: function() {
			this.openDatabase().then((db) => {
				// Eklemek istediğiniz veri
				const data = {
					Material: "100000020",
					Description: "Material 20",
					Price: 200,
					Stock: 100,
					Send: false 
				};

				// addData fonksiyonuna db ve data değerlerini gönderin
				this.addData(db, data)
					.then(() => {
						MessageToast.show("Veri başarıyla eklendi.");
					})
					.catch((error) => {
						MessageToast.show("Veri ekleme hatası:", error);
					});
			});
		}
	});
});