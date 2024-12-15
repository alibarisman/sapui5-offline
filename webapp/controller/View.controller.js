sap.ui.define([
	"sap/ui/core/mvc/Controller",
], function(Controller) {
	"use strict";

	return Controller.extend("com.socar.OfflineApp.controller.View", {

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
			}, 1000);
		}

	});
});