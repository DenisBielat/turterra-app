import { Icon } from '@/components/Icon';

/**
 * Formats a feature value for display in the UI.
 * Handles booleans (as icons), null/undefined, comma-separated lists, and strings.
 */
export function formatFeatureValue(value: unknown): React.ReactNode {
  // Handle null/undefined/unknown
  if (value === null || value === undefined || value === 'Unknown' || value === '-') {
    return '-';
  }

  // Convert to string if it's not already
  const stringValue = String(value);

  // Handle boolean values
  if (stringValue.toLowerCase() === 'true' || value === true) {
    return <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600" />;
  }
  if (stringValue.toLowerCase() === 'false' || value === false) {
    return <Icon name="close" size="sm" style="filled" className="text-gray-400" />;
  }

  // Handle comma-separated values
  if (stringValue.includes(',')) {
    return stringValue
      .split(',')
      .map(item => item.trim())
      .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(', ');
  }

  // Handle single value - capitalize first letter
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
}

/**
 * Formats a value for display in the variant modal.
 * Similar to formatFeatureValue but with slightly different styling for false values.
 */
export function formatModalValue(value: unknown): React.ReactNode {
  // Handle null, undefined, or empty
  if (!value && value !== false) return '-';

  const stringValue = String(value);

  // Boolean true
  if (stringValue.toLowerCase() === 'true' || value === true) {
    return <Icon name="checkmark-2" size="sm" style="filled" className="text-green-600" />;
  }
  // Boolean false
  if (stringValue.toLowerCase() === 'false' || value === false) {
    return <Icon name="close" size="sm" style="filled" className="text-red-500" />;
  }

  // Otherwise, just capitalize
  return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
}
