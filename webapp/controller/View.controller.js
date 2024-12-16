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
					this.getView().byId("synchronize").setEnabled(true);
				} else if (Offline.state === "down") {
					uiModel.setProperty("/ConnectionStatuText", "Offline");
					uiModel.setProperty("/ConnectionStatuIcon", "sap-icon://sys-cancel-2");
					uiModel.setProperty("/ConnectionStatuState", "Error");
					this.getView().byId("synchronize").setEnabled(false);
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
					if (!db.objectStoreNames.contains("materials")) {
						db.createObjectStore("materials", {
							keyPath: "id",
							autoIncrement: true
						});
					}
				};
			});
		},

		addData: function(db, data) {
			return new Promise((resolve, reject) => {
				const transaction = db.transaction(["materials"], "readwrite");
				const objectStore = transaction.objectStore("materials");

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
			let mock = this.getOwnerComponent().getModel("mock");
			let ui = this.getView().getModel("ui");
			let dataList = mock.getProperty("/requests");
			let material = mock.getProperty("/requests")[mock.getProperty("/requests").length - 1].Material;
			material = (Number(material) + 1).toString();

			this.openDatabase().then((db) => {
				// Eklemek istediğiniz veri
				const data = {
					Material: material,
					Description: "Material " + material,
					Price: "100.00",
					Stock: 100,
					Status: false
				};

				// addData fonksiyonuna db ve data değerlerini gönderin
				this.addData(db, data)
					.then(() => {
						MessageToast.show("Data added.");

						dataList.push(data);

						mock.setProperty("/requests", dataList);
						mock.refresh();

						ui.setProperty("/UnsynchronizedCount", ui.getProperty("/UnsynchronizedCount") + 1);
						ui.refresh();
					})
					.catch((error) => {
						MessageToast.show("Veri ekleme hatası:", error);
					});
			});
		},

		onSynchronize: function() {
			let mock = this.getOwnerComponent().getModel("mock");
			let ui = this.getView().getModel("ui");

			for (let i = 0; i < mock.getProperty("/requests").length; i++) {
				mock.getProperty("/requests")[i].Status = true;
			}

			mock.setProperty("/requests", mock.getProperty("/requests"));
			mock.refresh();

			ui.setProperty("/UnsynchronizedCount", 0);
			ui.refresh();
			
			this.clearTable("OfflineDatabase", "materials");
		},

		clearTable: function(dbName, storeName) {
			// Veritabanını aç
			const request = indexedDB.open(dbName);

			request.onsuccess = function(event) {
				const db = event.target.result;

				// Bir işlem başlat (readwrite modunda)
				const transaction = db.transaction(storeName, "readwrite");
				const objectStore = transaction.objectStore(storeName);

				// Tablodaki tüm verileri temizle
				const clearRequest = objectStore.clear();

				clearRequest.onsuccess = function() {
					console.log(`'${storeName}' tablosu başarıyla temizlendi.`);
				};

				clearRequest.onerror = function(event) {
					console.error("Tablo temizleme hatası:", event.target.error);
				};
			};

			request.onerror = function(event) {
				console.error("Veritabanı açılırken hata oluştu:", event.target.error);
			};
		}
	});
});