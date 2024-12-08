let pinAlertsMenu = false;

const helpLink = document.getElementById('Help');
if (helpLink) {
    const alertsMenuItem = document.createElement('li');
    alertsMenuItem.className = 'nav-main-submenu-list-item has-dropdown';

    const alertsMenuLink = document.createElement('a');
    alertsMenuLink.className = 'nav-main-submenu-link-icon';
    alertsMenuLink.setAttribute('aria-label', 'Notifications');

    const alertsMenuIcon = document.createElement('i');
    alertsMenuIcon.id = 'alerts-menu-icon';
    alertsMenuIcon.className = 'far fa-bell';

    const alertsMenuLabel = document.createElement('div');
    alertsMenuLabel.className = 'nav-main-submenu-link-text';
    alertsMenuLabel.innerText = ' Alerts ';

    const alertsDropdown = document.createElement('div');
    alertsDropdown.id = 'alerts-dropdown';
    alertsDropdown.className = 'nav-main-dropdown';

    const alertsDropdownList = document.createElement('ul');
    alertsDropdownList.id = 'alerts-dropdown-list'
    alertsDropdownList.className = 'nav-main-dropdown-list';

    alertsDropdown.appendChild(alertsDropdownList);

    const clearNotificationsItem = document.createElement('li');
    clearNotificationsItem.className = 'nav-main-dropdown-list-item notification-item';

    const clearNotificationsLink = document.createElement('a');
    clearNotificationsLink.className = 'nav-main-dropdown-link notification-link';
    clearNotificationsLink.innerText = 'Clear Notifications';

    clearNotificationsLink.addEventListener('click', function () {
        saveNotifications([]);
        clearBell();
        hideNotificationsDropdown();
    });

    clearNotificationsItem.appendChild(clearNotificationsLink);
    
    const alertsMenuSeparator = document.createElement('hr');
    alertsMenuSeparator.className = 'alerts-menu-separator';

    const noNotificationsItem = document.createElement('li');
    noNotificationsItem.className = 'nav-main-dropdown-list-item notification-item';

    const noNotificationsLink = document.createElement('a');
    noNotificationsLink.className = 'nav-main-dropdown-link notification-link';
    noNotificationsLink.innerText = 'You have no notifications';

    noNotificationsItem.appendChild(noNotificationsLink);

    function hideNotificationsDropdown() {
        pinAlertsMenu = false;
        alertsDropdown.style.visibility = 'hidden';
        alertsDropdown.style.opacity = '0';
    }

    function showNotificationsDropdown(markRead) {
        loadNotifications().then(notifications => {
            alertsDropdownList.replaceChildren();

            if (notifications.length) {
                alertsDropdownList.appendChild(clearNotificationsItem);
                alertsDropdownList.appendChild(alertsMenuSeparator);
            } else {
                alertsDropdownList.appendChild(noNotificationsItem);
            }

            function createNotificationItem(data) {
                const item = document.createElement('li');
                item.className = 'nav-main-dropdown-list-item notification-item';

                const link = document.createElement('a');
                link.className = 'nav-main-dropdown-link notification-link';
                link.href = getNotificationTarget(data);

                const iconImg = document.createElement('img');
                iconImg.src = getNotificationIcon(data);
                iconImg.className = 'notification-icon';

                const title = document.createElement('p');
                title.className = 'notification-title';
                title.innerText = getNotificationHistoryTitle(data);

                const body = document.createElement('p');
                body.className = 'notification-body';
                body.innerText = getNotificationHistoryBody(data);

                if (!data.read) {
                    link.classList.add('notification-unread');
                }

                link.addEventListener('click', function () {
                    data.read = true;
                    saveNotifications(notifications);
                });

                link.appendChild(iconImg);
                link.appendChild(title);
                link.appendChild(body);
                item.appendChild(link);
                return item;
            }

            notifications.slice().reverse().forEach(data => {
                alertsDropdownList.appendChild(createNotificationItem(data));
                if (markRead) {
                    data.read = true;
                }
            });

            saveNotifications(notifications);

            alertsDropdown.style.visibility = 'visible';
            alertsDropdown.style.opacity = '1';
        });
    }

    alertsMenuItem.addEventListener('mouseenter', function () {
        showNotificationsDropdown(false);
    });
    alertsMenuItem.addEventListener('mouseleave', function () {
        if (!pinAlertsMenu) {
            hideNotificationsDropdown();
        }
    });

    alertsMenuLink.addEventListener('click', function () {
        clearBell();
        if (!pinAlertsMenu) {
            pinAlertsMenu = true;
            showNotificationsDropdown(true);
        } else {
            hideNotificationsDropdown();
        }
    });

    document.addEventListener('click', function (event) {
        if (pinAlertsMenu && !alertsMenuItem.contains(event.target)) {
            hideNotificationsDropdown();
        }
    });

    alertsMenuLink.appendChild(alertsMenuIcon);
    alertsMenuLink.appendChild(alertsMenuLabel);
    alertsMenuItem.appendChild(alertsMenuLink);
    alertsMenuItem.appendChild(alertsDropdown);
    helpLink.parentNode.parentNode.insertBefore(alertsMenuItem, helpLink.parentNode);
}

function clearBell() {
    const alertsMenuIcon = document.getElementById('alerts-menu-icon');
    if (alertsMenuIcon) {
        alertsMenuIcon.classList.remove('fas');
        alertsMenuIcon.classList.remove('unread-alerts');
    }
}

function ringBell() {
    const alertsMenuIcon = document.getElementById('alerts-menu-icon');
    if (alertsMenuIcon) {
        alertsMenuIcon.classList.add('fas');
        alertsMenuIcon.classList.add('unread-alerts');
    }
}

function checkUnreadNotifications() {
    loadNotifications().nonnull().then(notifications => {
        if (notifications.find(notification => !notification.read)) {
            ringBell();
        } else {
            clearBell();
        }
    });
}

window.setInterval(checkUnreadNotifications, 2000);
checkUnreadNotifications();