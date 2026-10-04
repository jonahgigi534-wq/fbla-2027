/**
 * The input fields the checkout screen asks for, and the shape rules on each one.
 *
 * Used by ui/screens/checkout.js.
 */

import { formField } from '../components/formField.js';
import {
  validateCardNumber,
  validateEmail,
  validateExpiryFormat,
  validateName,
  validatePhone,
  validateSecurityCode,
  validateStreet,
  validateZip,
} from '../../domain/validation.js';

/**
 * Builds every field the checkout form needs.
 *
 * @param {object} options What the fields depend on.
 * @param {object} options.location The restaurant being ordered from.
 * @param {boolean} options.isDelivery Whether this order is being delivered.
 * @returns {object} Field name to the field object formField returns.
 */
export function buildCheckoutFields({ location, isDelivery }) {
  const fields = {
    name: formField({
      id: 'co-name',
      label: 'Name for the order',
      validate: validateName,
      autocomplete: 'name',
    }),
    phone: formField({
      id: 'co-phone',
      label: 'Phone number',
      validate: validatePhone,
      type: 'tel',
      placeholder: '(713) 528-3816',
      hint: 'We call this number if there is a question about your order.',
      autocomplete: 'tel',
    }),
    email: formField({
      id: 'co-email',
      label: 'Email for the receipt',
      validate: validateEmail,
      type: 'email',
      autocomplete: 'email',
    }),
  };

  if (isDelivery) {
    fields.street = formField({
      id: 'co-street',
      label: 'Street address',
      validate: validateStreet,
      placeholder: '3112 Kirby Drive',
      autocomplete: 'street-address',
    });
    fields.zip = formField({
      id: 'co-zip',
      label: 'ZIP code',
      validate: validateZip,
      placeholder: '77098',
      hint: `${location.name} delivers to ${location.deliveryZips.join(', ')}.`,
      autocomplete: 'postal-code',
    });
  }

  fields.card = formField({
    id: 'co-card',
    label: 'Card number',
    validate: validateCardNumber,
    placeholder: '4111 1111 1111 1111',
    hint: 'Your card is not charged here, and only the last four digits are saved.',
  });
  fields.expiry = formField({
    id: 'co-expiry',
    label: 'Expiry',
    validate: validateExpiryFormat,
    placeholder: 'MM/YY',
  });
  fields.security = formField({
    id: 'co-security',
    label: 'Security code',
    validate: validateSecurityCode,
    placeholder: '123',
  });

  return fields;
}
