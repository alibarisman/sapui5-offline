sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function(NumberFormat) {
	"use strict";

	return {
		clearLeadingZeros: function(val) {
			if (isNaN(val)) {
				return val;
			} else if (val === "") {
				return val;
			} else {
				return Number(val);
			}
		},

		currencyFormat: function(sValue) {
			let oCurrencyFormat = NumberFormat.getCurrencyInstance();

			oCurrencyFormat.format(Number(sValue));
			return oCurrencyFormat.format(Number(sValue));
		},

		convertParseFloatFour: function(value) {
			let price = value;

			return parseFloat(price).toFixed(4);
		},

		convertParseFloatThree: function(value) {
			let price = value;

			return parseFloat(price).toFixed(3);
		},

		convertTrueFalse: function(value) {
			let sValue = "";

			if (value === "X" || value === true) {
				sValue = true;
			} else {
				sValue = false;
			}

			return sValue;
		},

		stateFormat: function(sOnyrd) {
			let sState = "";

            if(sOnyrd) {
                sState = "Success";
            } else {
                sState = "Error";
            }

            return sState;
		},

        stateFormatText: function(sOnyrd) {
			let sState = "";

            if(sOnyrd) {
                sState = "Synchronized";
            } else {
                sState = "Not Synchronized";
            }

            return sState;
		},

		stateFormatIcon: function(sOnyrd) {
			let sState = "";

            if(sOnyrd) {
                sState = "sap-icon://sys-enter";
            } else {
                sState = "sap-icon://unsynchronize";
            }

            return sState;
		}
	};
});