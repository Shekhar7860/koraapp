import dayjs from 'dayjs';
import PropTypes from 'prop-types';

export const StylePropType = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.number,
  PropTypes.bool,
]);

export function isSameDay(currentMessage = {}, diffMessage = {}) {
  const currentCreatedAt = dayjs(currentMessage.createdAt);
  const diffCreatedAt = dayjs(diffMessage.createdAt);
  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
    return false;
  }
  return currentCreatedAt.isSame(diffCreatedAt, 'day');
}

export function isSameUser(currentMessage = {}, diffMessage = {}) {
  return !!(
    diffMessage.user &&
    currentMessage.user &&
    diffMessage.user._id === currentMessage.user._id
  );
}
