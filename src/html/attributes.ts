import { type TemplateResult, html } from 'lit';

/**
 * Renders the entity attributes in a list
 * @param {Record<string, any>} attributes - The entity attributes
 * @returns {TemplateResult} The rendered attributes list
 */
export const attributes = (attributes: Record<string, any>): TemplateResult => {
  // Filter out common attributes that are less interesting or already shown
  const filteredAttributes = { ...attributes };

  // List of attributes to exclude
  const excludeList = [
    'icon',
    'friendly_name',
    'entity_picture',
    'supported_features',
    'assumed_state',
    'attribution',
    'hidden',
  ];

  excludeList.forEach((attr) => delete filteredAttributes[attr]);

  const attributeEntries = Object.entries(filteredAttributes);

  if (attributeEntries.length === 0) {
    return html`<div class="entity-attributes-empty">
      No additional attributes
    </div>`;
  }

  return html`
    <div class="entity-attributes">
      ${attributeEntries.map(
        ([key, value]) => html`
          <div class="attribute-row">
            <span class="attribute-key">${key}:</span>
            <span class="attribute-value"
              >${typeof value === 'object'
                ? JSON.stringify(value)
                : value}</span
            >
          </div>
        `,
      )}
    </div>
  `;
};
