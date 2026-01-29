import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { notificationService } from '../../services/notificationService';

const WholesalerNotifications = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery(
    ['notifications', filter, page],
    () => notificationService.getNotifications({
      page,
      limit: 20,
      ...(filter !== 'all' && { isRead: filter === 'read' })
    }),
    {
      keepPreviousData: true
    }
  );

  // Fetch unread count
  const { data: unreadData } = useQuery(
    'unreadCount',
    () => notificationService.getUnreadCount(),
    {
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Mark as read mutation
  const markAsReadMutation = useMutation(
    (id) => notificationService.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('unreadCount');
        toast.success('Notification marked as read');
      },
      onError: () => {
        toast.error('Failed to mark notification as read');
      }
    }
  );

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation(
    () => notificationService.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('unreadCount');
        toast.success('All notifications marked as read');
      },
      onError: () => {
        toast.error('Failed to mark all as read');
      }
    }
  );

  // Delete notification mutation
  const deleteNotificationMutation = useMutation(
    (id) => notificationService.deleteNotification(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('unreadCount');
        toast.success('Notification deleted');
      },
      onError: () => {
        toast.error('Failed to delete notification');
      }
    }
  );

  const notifications = data?.data?.data?.notifications || [];
  const pagination = data?.data?.data?.pagination || {};
  const unreadCount = unreadData?.data?.data?.unreadCount || 0;

  const getNotificationIcon = (type) => {
    const icons = {
      'new-order': '📦',
      'order-update': '📦',
      'low-stock': '📊',
      'account-approved': '✅',
      'account-rejected': '❌'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'new-order': '#3498db',
      'order-update': '#3498db',
      'low-stock': '#e74c3c',
      'account-approved': '#2ecc71',
      'account-rejected': '#e67e22'
    };
    return colors[type] || '#7f8c8d';
  };

  const getNotificationTitle = (type) => {
    const titles = {
      'new-order': 'New Order',
      'order-update': 'Order Update',
      'low-stock': 'Low Stock Alert',
      'account-approved': 'Account Approved',
      'account-rejected': 'Account Rejected'
    };
    return titles[type] || 'Notification';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isLoading}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
          {['all', 'unread', 'read'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => {
                setFilter(filterOption);
                setPage(1);
              }}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: filter === filterOption ? '2px solid var(--primary-color)' : '2px solid transparent',
                color: filter === filterOption ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: filter === filterOption ? '600' : '400',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
            >
              {filterOption}
              {filterOption === 'unread' && unreadCount > 0 && (
                <Badge variant="danger" style={{ marginLeft: '8px' }}>{unreadCount}</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: notification.isRead ? 'transparent' : 'rgba(52, 152, 219, 0.05)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  transition: 'background-color 0.3s ease'
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: getNotificationColor(notification.type) + '20',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {getNotificationTitle(notification.type)}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {notification.message}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>{formatDate(notification.createdAt)}</span>
                    <Badge variant="info" style={{ textTransform: 'capitalize' }}>
                      {notification.type}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notification._id)}
                      disabled={markAsReadMutation.isLoading}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: '1px solid var(--primary-color)',
                        backgroundColor: 'transparent',
                        color: 'var(--primary-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-color)';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--primary-color)';
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this notification?')) {
                        deleteNotificationMutation.mutate(notification._id);
                      }
                    }}
                    disabled={deleteNotificationMutation.isLoading}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: '1px solid var(--danger-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--danger-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'var(--danger-color)';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'var(--danger-color)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
                <Button
                  variant="secondary"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WholesalerNotifications;
