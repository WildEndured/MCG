/* ============================================================
   TABLE.JS — полноэкранная вкладка «📋 Таблица»
   Заполняется из генератора + редактируется вручную.
   Хранится в State.getProject().tableState
   ============================================================ */

'use strict';

const Table = (() => {

  let rootEl = null;

  /* ============================================================
     СОСТОЯНИЕ
     Храним в project.tableState:
       {
         "<moduleId>|<groupId>|<attrId>": {
            value: "строка",
            modifier: "строка" (только для одежды)
         }
       }
     ============================================================ */

  function getState() {
    const proj = State.getProject();
    if (!proj.tableState) proj.tableState = {};
    return proj.tableState;
  }

  function key(moduleId, groupId, attrId) {
    return moduleId + '|' + groupId + '|' + attrId;
  }

  function getCell(moduleId, groupId, attrId) {
    return getState()[key(moduleId, groupId, attrId)] || { value: '', modifier: '' };
  }

  function setCell(moduleId, groupId, attrId, patch) {
    const s = getState();
    const k = key(moduleId, groupId, attrId);
    const cur = s[k] || { value: '', modifier: '' };
    s[k] = Object.assign(cur, patch || {});
    State.touch();
    State.emit('state:changed');
  }

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ
     ============================================================ */

  function init() {
    rootEl = document.getElementById('table-content');
    if (!rootEl) {
      console.warn('[Table] #table-content not found');
      return;
    }

    // Кнопки в шапке
    bindButton('btn-table-clear',   clearAll);
    bindButton('btn-table-export',  exportTable);
    bindButton('btn-table-import',  () => {
      const input = document.getElementById('file-table');
      if (input) input.click();
    });
    bindButton('btn-table-fill',    fillFromGenerator);

    // Импорт файла
    const fileInput = document.getElementById('file-table');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = (e.target.files || [])[0];
        e.target.value = '';
        if (!file) return;
        try {
          const text = await readFileAsText(file);
          const data = JSON.parse(text);
          if (data && typeof data === 'object') {
            State.getProject().tableState = data;
            State.touch();
            State.emit('state:changed');
            render();
            toast('Таблица загружена', 'ok');
          }
        } catch (err) {
          console.error(err);
          toast('Ошибка импорта', 'error');
        }
      });
    }

    State.on('state:changed', render);
    State.on('state:loaded',  render);

    render();
  }

  function bindButton(id, fn) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', fn);
  }

  /* ============================================================
     РЕНДЕР
     ============================================================ */

  function render() {
    if (!rootEl) return;
    rootEl.innerHTML = '';

    const modules = TableData.MODULES;
    modules.forEach(m => {
      rootEl.appendChild(renderModule(m));
    });
  }

  function renderModule(m) {
    const box = el('div', {
      style: {
        background: 'var(--panel)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '14px',
        border: '1px solid var(--border)',
      },
    });

    // Заголовок модуля
    const head = el('div', {
      style: {
        background: m.color || 'var(--panel-3)',
        color: '#1a1a1a',
        padding: '10px 14px',
        fontWeight: '700',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        flexWrap: 'wrap',
      },
    });

    head.appendChild(el('span', { text: m.name }));

    const headActions = el('div', { style: { display: 'flex', gap: '6px' } });
    headActions.appendChild(el('button', {
      style: {
        background: 'rgba(0,0,0,0.2)',
        color: '#1a1a1a',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
      },
      onclick: () => clearModule(m.id),
    }, ['Очистить модуль']));
    head.appendChild(headActions);
    box.appendChild(head);

    // Группы
    const body = el('div', { style: { padding: '12px' } });
    m.groups.forEach(g => body.appendChild(renderGroup(m, g)));
    box.appendChild(body);

    return box;
  }

  function renderGroup(m, g) {
    const box = el('div', { style: { marginBottom: '12px' } });

    // Заголовок группы
    if (g.name) {
      const groupHead = el('div', {
        style: {
          background: 'var(--panel-2)',
          padding: '6px 10px',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '13px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        },
      });
      groupHead.appendChild(el('span', { text: g.name }));
      groupHead.appendChild(el('button', {
        class: 'mini-btn',
        style: { fontSize: '11px', padding: '3px 8px', minHeight: '24px' },
        onclick: () => clearGroup(m.id, g.id),
      }, ['Очистить']));
      box.appendChild(groupHead);
    }

    // Колонки для одежды
    if (g.columns && g.columns.length) {
      const headerRow = el('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          padding: '4px 0',
          marginBottom: '4px',
          fontSize: '11px',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600',
        },
      });
      headerRow.appendChild(el('div', {}));
      headerRow.appendChild(el('div', { text: g.columns[0] }));
      headerRow.appendChild(el('div', { text: g.columns[1] }));
      box.appendChild(headerRow);
    }

    // Атрибуты
    g.attributes.forEach(a => box.appendChild(renderAttrRow(m, g, a)));

    return box;
  }

  function renderAttrRow(m, g, a) {
    const cell = getCell(m.id, g.id, a.id);
    const hasColumns = g.columns && g.columns.length === 2;

    const row = el('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: hasColumns ? '1fr 1fr 1fr' : '1fr 1fr',
        gap: '6px',
        alignItems: 'center',
        padding: '4px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      },
    });

    // Метка
    row.appendChild(el('div', {
      style: {
        fontSize: '13px',
        color: 'var(--text)',
        paddingLeft: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      text: a.label || '',
    }));

    // Значение
    if (hasColumns) {
      // Модификатор
      row.appendChild(renderCell(m, g, a, 'modifier', cell.modifier));
      // Значение
      row.appendChild(renderCell(m, g, a, 'value', cell.value));
    } else {
      // Одно поле — растянуть
      row.appendChild(renderCell(m, g, a, 'value', cell.value));
    }

    return row;
  }

  function renderCell(m, g, a, field, value) {
    const wrapper = el('div', {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },
    });

    const input = el('input', {
      type: 'text',
      value: value || '',
      placeholder: field === 'modifier' ? 'мод.' : '—',
      style: {
        flex: '1 1 auto',
        fontSize: '13px',
        padding: '6px 28px 6px 10px',
        minWidth: 0,
      },
      dataset: { module: m.id, group: g.id, attr: a.id, field },
    });

    input.addEventListener('input', () => {
      setCell(m.id, g.id, a.id, { [field]: input.value });
      // Автосвязь: если это поле «value», синхронизируем с атрибутами системы Attributes
      if (field === 'value') {
        syncToAttributes(m, g, a, input.value);
      }
    });

    wrapper.appendChild(input);

    // Кнопка очистки ячейки
    const clearBtn = el('button', {
      style: {
        position: 'absolute',
        right: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-dim)',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '2px 6px',
        opacity: '0.6',
      },
      title: 'Очистить',
      onclick: (e) => {
        e.stopPropagation();
        input.value = '';
        setCell(m.id, g.id, a.id, { [field]: '' });
        if (field === 'value') syncToAttributes(m, g, a, '');
      },
    }, ['✖']);
    wrapper.appendChild(clearBtn);

    // Автокомплит по элементам привязанной категории
    const catId = getLinkedCategoryId(m.id, g.id, a.id);
    if (catId) {
      const suggestions = () => {
        const cat = State.getCategories().find(c => c.id === catId);
        if (!cat || !cat.items) return [];
        const q = (input.value || '').toLowerCase().trim();
        if (!q) return cat.items.slice(0, 8);
        return cat.items.filter(i => (i.name || '').toLowerCase().includes(q)).slice(0, 8);
      };

      let suggestBox = null;

      function hideSuggest() {
        if (suggestBox && suggestBox.parentNode) suggestBox.parentNode.removeChild(suggestBox);
        suggestBox = null;
      }

      function showSuggest() {
        hideSuggest();
        const items = suggestions();
        if (!items.length) return;

        suggestBox = el('div', { class: 'attr-suggest' });
        items.forEach(it => {
          const row = el('div', {
            class: 'attr-suggest-item',
            onmousedown: (ev) => {
              ev.preventDefault();
              input.value = it.name || '';
              setCell(m.id, g.id, a.id, { [field]: input.value });
              if (field === 'value') syncToAttributes(m, g, a, input.value);
              hideSuggest();
            },
          });
          if (it.src) row.appendChild(el('img', { src: it.src }));
          row.appendChild(el('span', { text: it.name || '' }));
          suggestBox.appendChild(row);
        });
        wrapper.appendChild(suggestBox);
      }

      input.addEventListener('focus', showSuggest);
      input.addEventListener('input', showSuggest);
      input.addEventListener('blur', () => setTimeout(hideSuggest, 150));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { hideSuggest(); input.blur(); }
      });
    }

    return wrapper;
  }

  /* ============================================================
     СИНХРОНИЗАЦИЯ С ATTRIBUTES
     Таблица управляет атрибутами системы Attributes (по label).
     ============================================================ */

  function syncToAttributes(m, g, a, value) {
    // Найти атрибут в системе Attributes по label и установить значение
    if (!a.label) return;
    const label = a.label.replace(/:$/, '').trim();
    Attributes.flatten().forEach(({ attr }) => {
      const attrLabel = (attr.label || '').replace(/:$/, '').trim();
      if (attrLabel === label) {
        if (attr.value !== value) {
          attr.value = value;
          State.touch();
        }
      }
    });
    // Также дать Renderer перерисовать
    Renderer.requestRender();
  }

  /**
   * Обратная синхронизация: из Attributes → в таблицу.
   * Вызывается после applyToConstructor в генераторе.
   */
  function syncFromAttributes() {
    const s = getState();
    let touched = 0;

    TableData.MODULES.forEach(m => {
      m.groups.forEach(g => {
        g.attributes.forEach(a => {
          if (!a.label) return;
          const label = a.label.replace(/:$/, '').trim();

          // Ищем атрибут с таким же label в Attributes
          for (const { attr } of Attributes.flatten()) {
            const attrLabel = (attr.label || '').replace(/:$/, '').trim();
            if (attrLabel === label && attr.value) {
              const k = key(m.id, g.id, a.id);
              const cur = s[k] || { value: '', modifier: '' };
              if (cur.value !== attr.value) {
                s[k] = Object.assign(cur, { value: attr.value });
                touched++;
              }
              break;
            }
          }
        });
      });
    });

    if (touched) {
      State.touch();
      State.emit('state:changed');
    }
    return touched;
  }

  /* ============================================================
     ПРИВЯЗКА КАТЕГОРИИ
     Автоопределение по label: если label содержит "Bangs" и есть
     категория с "Причёска" — считаем связанными. Иначе — null.
     ============================================================ */

  function getLinkedCategoryId(moduleId, groupId, attrId) {
    // 1. Явная привязка в state
    const linked = getState().__links || {};
    const k = key(moduleId, groupId, attrId);
    if (linked[k]) return linked[k];

    // 2. Автопоиск по label
    const m = TableData.findModule(moduleId);
    if (!m) return null;
    const g = (m.groups || []).find(x => x.id === groupId);
    if (!g) return null;
    const a = (g.attributes || []).find(x => x.id === attrId);
    if (!a || !a.label) return null;

    const label = a.label.toLowerCase().replace(/:$/, '').trim();
    const cats = State.getCategories();

    for (const cat of cats) {
      const catName = (cat.name || '').toLowerCase();
      // Точное слово или частичное совпадение
      const words = label.split(/[\s_\-]+/).filter(w => w.length > 2);
      if (words.some(w => catName.includes(w))) return cat.id;
    }
    return null;
  }

  function setLinkedCategory(moduleId, groupId, attrId, categoryId) {
    const s = getState();
    if (!s.__links) s.__links = {};
    const k = key(moduleId, groupId, attrId);
    if (categoryId) s.__links[k] = categoryId;
    else delete s.__links[k];
    State.touch();
    State.emit('state:changed');
  }

  /* ============================================================
     ДЕЙСТВИЯ
     ============================================================ */

  async function clearAll() {
    const ok = await confirmDialog('Очистить всю таблицу?', 'Очистка');
    if (!ok) return;
    State.getProject().tableState = {};
    State.touch();
    State.emit('state:changed');
    render();
    toast('Таблица очищена', 'ok');
  }

  function clearModule(moduleId) {
    const s = getState();
    const m = TableData.findModule(moduleId);
    if (!m) return;
    m.groups.forEach(g => {
      g.attributes.forEach(a => {
        delete s[key(moduleId, g.id, a.id)];
      });
    });
    State.touch();
    State.emit('state:changed');
    render();
    toast('Модуль очищен', 'ok');
  }

  function clearGroup(moduleId, groupId) {
    const s = getState();
    const m = TableData.findModule(moduleId);
    if (!m) return;
    const g = (m.groups || []).find(x => x.id === groupId);
    if (!g) return;
    g.attributes.forEach(a => {
      delete s[key(moduleId, g.id, a.id)];
    });
    State.touch();
    State.emit('state:changed');
    render();
    toast('Группа очищена', 'ok');
  }

  function fillFromGenerator() {
    const n = syncFromAttributes();
    if (n) {
      toast('Заполнено из атрибутов: ' + n, 'ok');
      render();
    } else {
      toast('Нет данных для заполнения', 'warn');
    }
  }

  function exportTable() {
    const data = getState();
    downloadJSON({ version: 1, exportedAt: Date.now(), table: data }, 'table.json');
    toast('Экспортировано', 'ok');
  }

  /* ============================================================
     HOOK: вызывается из генератора после applyToConstructor
     ============================================================ */

  function onGeneratorApplied() {
    const n = syncFromAttributes();
    if (n > 0) {
      // Не показываем тост каждый раз
      console.log('[Table] автозаполнено из генератора:', n);
    }
    return n;
  }

  /* ---------- Экспорт ---------- */
  return {
    init,
    render,
    getState,
    getCell,
    setCell,
    getLinkedCategoryId,
    setLinkedCategory,
    clearAll,
    clearModule,
    clearGroup,
    fillFromGenerator,
    exportTable,
    syncFromAttributes,
    onGeneratorApplied,
  };
})();

window.Table = Table;
