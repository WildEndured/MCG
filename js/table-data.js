/* ============================================================
   TABLE-DATA.JS — структура таблицы атрибутов
   ============================================================ */

'use strict';

const TableData = (() => {

  /**
   * Модули таблицы.
   * Каждый модуль:
   *   - id: машинный id
   *   - name: отображаемое имя
   *   - color: цвет заголовка
   *   - groups: [{ id, name, attributes: [{ id, label, categoryId }] }]
   *     у одежды доп. колонки: модификатор, одежда
   */

  const MODULES = [
    {
      id: 'base_appearance',
      name: 'Модуль Базовой внешности',
      color: '#d98787',
      groups: [
        {
          id: 'hair',
          name: 'Волосы:',
          attributes: [
            { id: 'bangs',      label: 'Bangs',           categoryId: null },
            { id: 'sidelocks',  label: 'Sidelocks',       categoryId: null },
            { id: 'back_hair',  label: 'Back hair',       categoryId: null },
            { id: 'additional', label: 'Additional hair', categoryId: null },
          ],
        },
        {
          id: 'eyes',
          name: 'Глаза:',
          attributes: [
            { id: 'eye_form', label: 'Форма глаз', categoryId: null },
          ],
        },
        {
          id: 'torso',
          name: 'Торс',
          attributes: [
            { id: 'skin_color', label: 'Цвет кожи', categoryId: null },
          ],
        },
      ],
    },

    {
      id: 'clothes',
      name: 'Модуль одежды',
      color: '#a8c8e8',
      special: 'modifier_columns',
      groups: [
        {
          id: 'style',
          name: 'Стиль одежды:',
          attributes: [
            { id: 'style_value', label: '', categoryId: null },
          ],
        },
        {
          id: 'clothes',
          name: '',
          columns: ['Модификатор', 'Одежда'],
          attributes: [
            { id: 'headwear',    label: 'Headwear',      categoryId: null, modifier: '', value: '' },
            { id: 'neckwear',    label: 'Neckwear',      categoryId: null, modifier: '', value: '' },
            { id: 'handwear',    label: 'Handwear',      categoryId: null, modifier: '', value: '' },
            { id: 'topwear1',    label: 'Topwear 1',     categoryId: null, modifier: '', value: '' },
            { id: 'bottomwear',  label: 'Bottomwear',    categoryId: null, modifier: '', value: '' },
            { id: 'legwear',     label: 'Legwear',       categoryId: null, modifier: '', value: '' },
            { id: 'footwear',    label: 'Footwear',      categoryId: null, modifier: '', value: '' },
            { id: 'accessory1',  label: 'Accessories 1', categoryId: null, modifier: '', value: '' },
            { id: 'accessory2',  label: 'Accessories 2', categoryId: null, modifier: '', value: '' },
            { id: 'accessory3',  label: 'Accessories 3', categoryId: null, modifier: '', value: '' },
            { id: 'accessory4',  label: 'Accessories 4', categoryId: null, modifier: '', value: '' },
            { id: 'accessory5',  label: 'Accessories 5', categoryId: null, modifier: '', value: '' },
          ],
        },
      ],
    },

    {
      id: 'race',
      name: 'Модуль расы',
      color: '#e8d68a',
      groups: [
        {
          id: 'race_main',
          name: '',
          attributes: [
            { id: 'race',        label: 'Раса:',              categoryId: null },
            { id: 'race_feat1',  label: 'Расовая черта 1:',   categoryId: null },
            { id: 'race_feat2',  label: 'Расовая черта 2:',   categoryId: null },
            { id: 'race_feat3',  label: 'Расовая черта 3:',   categoryId: null },
            { id: 'race_feat4',  label: 'Расовая черта 4:',   categoryId: null },
            { id: 'race_feat5',  label: 'Расовая черта 5:',   categoryId: null },
            { id: 'race_feat6',  label: 'Расовая черта 6:',   categoryId: null },
            { id: 'race_feat7',  label: 'Расовая черта 7:',   categoryId: null },
          ],
        },
      ],
    },
  ];

  /* ---------- Экспорт ---------- */
  return {
    MODULES,
    findModule: (id) => MODULES.find(m => m.id === id) || null,
  };
})();

window.TableData = TableData;
