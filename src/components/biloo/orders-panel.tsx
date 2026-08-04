import type { ActiveOrder } from "@/data/biloo";

import { formatETB, Icon, serviceLabel, StatusPill } from "./ui";

export function OrdersPanel({
  orders,
  onTrackOrder,
}: {
  orders: ActiveOrder[];
  onTrackOrder: (order: ActiveOrder) => void;
}) {
  const activeOrders = orders.filter((order) => order.progress < 100);

  return (
    <section className="biloo-activity-panel">
      <div className="biloo-section-heading">
        <div>
          <span>Recent activity</span>
          <h2>Your rides and orders</h2>
        </div>
        <StatusPill tone={activeOrders.length ? "success" : "neutral"}>
          {activeOrders.length} active
        </StatusPill>
      </div>

      <div className="biloo-activity-list">
        {orders.slice(0, 6).map((order) => {
          const completed = order.progress >= 100;
          return (
            <button
              aria-label={`${completed ? "View" : "Track"} ${order.title}`}
              className="biloo-activity-item"
              data-completed={completed}
              key={order.id}
              onClick={() => onTrackOrder(order)}
              type="button"
            >
              <span className="biloo-activity-icon">
                <Icon name={order.service === "taxi" ? "taxi" : "receipt"} />
              </span>

              <span className="biloo-activity-main">
                <span className="biloo-activity-title-row">
                  <span>
                    <strong>{order.title}</strong>
                    <small>{serviceLabel(order.service)} · {order.id}</small>
                  </span>
                  <b>{formatETB(order.total)}</b>
                </span>

                <span className="biloo-activity-status-row">
                  <span>{order.status}</span>
                  <small>{completed ? "Completed" : order.eta}</small>
                </span>

                <span className="biloo-activity-progress" aria-label={`${order.progress}% complete`}>
                  <i style={{ width: `${Math.min(100, order.progress)}%` }} />
                </span>
              </span>

              <span className="biloo-activity-action">
                <span>{completed ? "View details" : "Track order"}</span>
                <Icon name="arrow" />
              </span>
            </button>
          );
        })}

        {!orders.length ? (
          <div className="biloo-empty-state">
            <span><Icon name="map" /></span>
            <strong>No activity yet</strong>
            <p>Your next ride or order will appear here with live progress.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
