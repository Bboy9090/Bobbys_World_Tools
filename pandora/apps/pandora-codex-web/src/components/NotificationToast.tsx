/**
 * NotificationToast - Global notification display component
 */

import { useNotificationStore, type Notification } from '../stores/notificationStore';

const icons = {
  success: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const colors = {
  success: 'from-green-500/20 to-green-600/10 border-green-500/50 text-green-400',
  error: 'from-red-500/20 to-red-600/10 border-red-500/50 text-red-400',
  warning: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50 text-yellow-400',
  info: 'from-grimoire-electric-blue/20 to-blue-600/10 border-grimoire-electric-blue/50 text-grimoire-neon-cyan'
};

const glows = {
  success: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  error: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  warning: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
  info: 'shadow-[0_0_20px_rgba(0,201,255,0.3)]'
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotificationStore();

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md
        bg-gradient-to-r ${colors[notification.type]} ${glows[notification.type]}
        animate-slide-in-right transform transition-all duration-300
      `}
    >
      <div className="flex-shrink-0">
        {icons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
        <p className="text-sm opacity-80 mt-0.5">{notification.message}</p>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-xs font-medium underline hover:no-underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function NotificationToast() {
  const { notifications } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem notification={notification} />
        </div>
      ))}
    </div>
  );
}
