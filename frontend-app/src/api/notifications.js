// API để lấy thông báo của staff
export const getStaffNotifications = async (stationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/staff-notifications/station/${stationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch notifications');
  } catch (error) {
    console.error('Error fetching staff notifications:', error);
    throw error;
  }
};

export const getUnreadNotifications = async (stationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/staff-notifications/station/${stationId}/unread`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch unread notifications');
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};

export const getUnreadCount = async (stationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/staff-notifications/station/${stationId}/unread/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch unread count');
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/staff-notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (stationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/staff-notifications/station/${stationId}/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};