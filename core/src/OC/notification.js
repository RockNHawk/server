/*
 * @copyright 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2019 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import _ from 'underscore'
import $ from 'jquery'

/**
 * @todo Write documentation
 * @deprecated 17.0.0 use OCP.Toast
 * @namespace OC.Notification
 */
export default {
	queuedNotifications: [],
	getDefaultNotificationFunction: null,

	/**
	 * @type Array<int>
	 * @description array of notification timers
	 */
	notificationTimers: [],

	updatableNotification: null,

	/**
	 * @param callback
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	setDefault: function (callback) {
		this.getDefaultNotificationFunction = callback;
	},

	/**
	 * Hides a notification.
	 *
	 * If a row is given, only hide that one.
	 * If no row is given, hide all notifications.
	 *
	 * @param {jQuery} [$row] notification row
	 * @param {Function} [callback] callback
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	hide: function ($row, callback) {
		var self = this;
		var $notification = $('#notification');

		if (_.isFunction($row)) {
			// first arg is the callback
			callback = $row;
			$row = undefined;
		}

		if (!$row) {
			console.warn('Missing argument $row in OC.Notification.hide() call, caller needs to be adjusted to only dismiss its own notification');
			// assume that the row to be hidden is the first one
			$row = $notification.find('.row:first');
		}

		if ($row && $notification.find('.row').length > 1) {
			// remove the row directly
			$row.remove();
			if (callback) {
				callback.call();
			}
			return;
		}

		_.defer(function () {
			// fade out is supposed to only fade when there is a single row
			// however, some code might call hide() and show() directly after,
			// which results in more than one element
			// in this case, simply delete that one element that was supposed to
			// fade out
			//
			// FIXME: remove once all callers are adjusted to only hide their own notifications
			if ($notification.find('.row').length > 1) {
				$row.remove();
				return;
			}

			// else, fade out whatever was present
			$notification.fadeOut('400', function () {
				if (self.isHidden()) {
					if (self.getDefaultNotificationFunction) {
						self.getDefaultNotificationFunction.call();
					}
				}
				if (callback) {
					callback.call();
				}
				$notification.empty();
			});
		});
	},

	/**
	 * Shows a notification as HTML without being sanitized before.
	 * If you pass unsanitized user input this may lead to a XSS vulnerability.
	 * Consider using show() instead of showHTML()
	 *
	 * @param {string} html Message to display
	 * @param {Object} [options] options
	 * @param {string} [options.type] notification type
	 * @param {int} [options.timeout=0] timeout value, defaults to 0 (permanent)
	 * @return {jQuery} jQuery element for notification row
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	showHtml: function (html, options) {
		options = options || {}
		options.showHtml = true
		window.OCP.Toast.message(html, options);
	},

	/**
	 * Shows a sanitized notification
	 *
	 * @param {string} text Message to display
	 * @param {Object} [options] options
	 * @param {string} [options.type] notification type
	 * @param {int} [options.timeout=0] timeout value, defaults to 0 (permanent)
	 * @return {jQuery} jQuery element for notification row
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	show: function (text, options) {
		window.OCP.Toast.message(text, options);
	},

	/**
	 * Updates (replaces) a sanitized notification.
	 *
	 * @param {string} text Message to display
	 * @return {jQuery} JQuery element for notificaiton row
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	showUpdate: function (text) {
		var $permanent = $('.toast.permanent');
		if ($permanent.length !== 0) {
			$permanent.hide()
		}
		this.updatableNotification = OCP.Toast.message(text, {type: 'permanent', timeout: 60})
	},

	/**
	 * Shows a notification that disappears after x seconds, default is
	 * 7 seconds
	 *
	 * @param {string} text Message to show
	 * @param {array} [options] options array
	 * @param {int} [options.timeout=7] timeout in seconds, if this is 0 it will show the message permanently
	 * @param {boolean} [options.isHTML=false] an indicator for HTML notifications (true) or text (false)
	 * @param {string} [options.type] notification type
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	showTemporary: function (text, options) {
		options = options || {}
		options.timeout = options.timeout || 7;
		window.OCP.Toast.message(text, options);
	},

	/**
	 * Returns whether a notification is hidden.
	 * @return {boolean}
	 * @deprecated 17.0.0 use OCP.Toast
	 */
	isHidden: function () {
		return !$("#notification").find('.row').length;
	}
}
