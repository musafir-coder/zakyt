'use strict';

// Константы
const NISAB_GOLD_GRAMS   = 85;
const NISAB_SILVER_GRAMS = 595;
const ZAKAT_RATE = 0.025;

let nisabStandard = 'gold'; // 'gold' | 'silver'
let harvestRate = 0.1;      // 10% дождевой, 5% искусственный

// Элементы
const goldPriceInput   = document.getElementById('goldPrice');
const silverPriceInput = document.getElementById('silverPrice');
const goldInput        = document.getElementById('gold');
const silverInput      = document.getElementById('silver');
const cashInput        = document.getElementById('cash');
const savingsInput     = document.getElementById('savings');
const goodsInput       = document.getElementById('goods');
const cryptoInput      = document.getElementById('crypto');
const stocksInput      = document.getElementById('stocks');
const livestockInput   = document.getElementById('livestock');
const harvestInput     = document.getElementById('harvest');
const rentalInput      = document.getElementById('rental');
const receivableInput  = document.getElementById('receivable');
const harvestBtns      = document.querySelectorAll('.harvest-btn');
const payableInput     = document.getElementById('payable');
const calcBtn          = document.getElementById('calcBtn');
const resultPlaceholder= document.getElementById('resultPlaceholder');
const resultContent    = document.getElementById('resultContent');
const goldRubEl        = document.getElementById('goldRub');
const silverRubEl      = document.getElementById('silverRub');
const nisabDisplay     = document.getElementById('nisabDisplay');
const goldPriceDisplay = document.getElementById('goldPriceDisplay');
const nisabDesc        = document.getElementById('nisabDesc');
const nisabNote        = document.getElementById('nisabNote');
const nisabToggleBtns  = document.querySelectorAll('.nisab-toggle__btn');

// Утилиты
function val(el) {
  return Math.max(0, parseFloat(el.value) || 0);
}

function fmt(n) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n)) + ' ₽';
}

function goldPrice() {
  return Math.max(1, parseFloat(goldPriceInput.value) || 7500);
}

function silverPrice() {
  return Math.max(1, parseFloat(silverPriceInput.value) || 80);
}


function currentNisab() {
  return nisabStandard === 'gold'
    ? NISAB_GOLD_GRAMS * goldPrice()
    : NISAB_SILVER_GRAMS * silverPrice();
}

// Обновление отображения нисаба
function updateNisabDisplay() {
  const nisab = currentNisab();
  nisabDisplay.textContent = fmt(nisab);

  if (nisabStandard === 'gold') {
    const price = goldPrice();
    goldPriceDisplay.textContent = new Intl.NumberFormat('ru-RU').format(price);
    nisabDesc.innerHTML = 'Минимальный порог — стоимость <strong>85 граммов золота</strong>';
    nisabNote.innerHTML = 'при цене золота <span id="goldPriceDisplay">' + new Intl.NumberFormat('ru-RU').format(price) + '</span> ₽/г';
  } else {
    const price = silverPrice();
    nisabDesc.innerHTML = 'Минимальный порог — стоимость <strong>595 граммов серебра</strong>';
    nisabNote.innerHTML = 'при цене серебра ' + new Intl.NumberFormat('ru-RU').format(price) + ' ₽/г';
  }
}

// Live-пересчёт граммов в рубли
function updateGoldHint() {
  const grams = val(goldInput);
  goldRubEl.textContent = grams > 0 ? `≈ ${fmt(grams * goldPrice())}` : '≈ 0 ₽';
}

function updateSilverHint() {
  const grams = val(silverInput);
  silverRubEl.textContent = grams > 0 ? `≈ ${fmt(grams * silverPrice())}` : '≈ 0 ₽';
}

// Главный расчёт
function calculate() {
  const nisab      = currentNisab();
  const goldRub    = val(goldInput) * goldPrice();
  const silverRub  = val(silverInput) * silverPrice();
  const cash       = val(cashInput);
  const savings    = val(savingsInput);
  const goods      = val(goodsInput);
  const crypto     = val(cryptoInput);
  const stocks     = val(stocksInput);
  const livestock  = val(livestockInput);
  const harvest    = val(harvestInput);
  const rental     = val(rentalInput);
  const receivable = val(receivableInput);
  const payable    = val(payableInput);

  const totalAssets   = goldRub + silverRub + cash + savings + goods + crypto + stocks + livestock + rental + receivable;
  const netAssets     = Math.max(0, totalAssets - payable);
  const zakatMal      = netAssets >= nisab ? netAssets * ZAKAT_RATE : 0;
  const zakatHarvest  = harvest * harvestRate;
  const zakatDue      = zakatMal + zakatHarvest;
  const obligatory    = netAssets >= nisab || harvest > 0;

  renderResult({
    goldRub, silverRub, cash, savings, goods, crypto, stocks, livestock, rental, receivable, payable,
    harvest, harvestRate, totalAssets, netAssets, nisab, zakatMal, zakatHarvest, zakatDue, obligatory,
  });
}

function renderResult(d) {
  resultPlaceholder.style.display = 'none';
  resultContent.style.display = 'block';

  const rows = [
    d.goldRub    > 0 ? `<li><span class="bd-label">Золото</span><span class="bd-value">${fmt(d.goldRub)}</span></li>` : '',
    d.silverRub  > 0 ? `<li><span class="bd-label">Серебро</span><span class="bd-value">${fmt(d.silverRub)}</span></li>` : '',
    d.cash       > 0 ? `<li><span class="bd-label">Наличные</span><span class="bd-value">${fmt(d.cash)}</span></li>` : '',
    d.savings    > 0 ? `<li><span class="bd-label">Сбережения</span><span class="bd-value">${fmt(d.savings)}</span></li>` : '',
    d.goods      > 0 ? `<li><span class="bd-label">Товары</span><span class="bd-value">${fmt(d.goods)}</span></li>` : '',
    d.crypto     > 0 ? `<li><span class="bd-label">Криптовалюта</span><span class="bd-value">${fmt(d.crypto)}</span></li>` : '',
    d.stocks     > 0 ? `<li><span class="bd-label">Акции</span><span class="bd-value">${fmt(d.stocks)}</span></li>` : '',
    d.rental     > 0 ? `<li><span class="bd-label">Арендный доход</span><span class="bd-value">${fmt(d.rental)}</span></li>` : '',
    d.receivable > 0 ? `<li><span class="bd-label">Долги к получению</span><span class="bd-value">${fmt(d.receivable)}</span></li>` : '',
    d.payable    > 0 ? `<li><span class="bd-label">Минус долги</span><span class="bd-value bd-value--deduct">−${fmt(d.payable)}</span></li>` : '',
    `<li><span class="bd-label">Чистые активы</span><span class="bd-value bd-value--total">${fmt(d.netAssets)}</span></li>`,
    `<li><span class="bd-label">Нисаб</span><span class="bd-value bd-value--nisab">${fmt(d.nisab)}</span></li>`,
  ].filter(Boolean).join('');

  const harvestRows = d.harvest > 0 ? `
    <li class="bd-section-title"><span>Урожай</span></li>
    <li><span class="bd-label">Стоимость урожая</span><span class="bd-value">${fmt(d.harvest)}</span></li>
    <li><span class="bd-label">Ставка (${d.harvestRate === 0.1 ? 'дождевой' : 'искусственный полив'})</span><span class="bd-value">${d.harvestRate * 100}%</span></li>
    <li><span class="bd-label">Закят с урожая</span><span class="bd-value bd-value--total">${fmt(d.zakatHarvest)}</span></li>
  ` : '';

  const statusHtml = d.obligatory
    ? `<div class="result-status result-status--ok"><span class="result-dot"></span>Закят обязателен</div>`
    : `<div class="result-status result-status--no"><span class="result-dot"></span>Ниже нисаба — закят не обязателен</div>`;

  const amountClass = d.zakatDue > 0 ? 'result-main__amount' : 'result-main__amount result-main__amount--zero';
  const amountText  = d.zakatDue > 0 ? fmt(d.zakatDue) : '—';

  const subtotalRows = (d.zakatMal > 0 && d.zakatHarvest > 0) ? `
    <li class="bd-section-title"><span>Итого</span></li>
    <li><span class="bd-label">Закят аль-маль (2.5%)</span><span class="bd-value">${fmt(d.zakatMal)}</span></li>
    <li><span class="bd-label">Закят с урожая</span><span class="bd-value">${fmt(d.zakatHarvest)}</span></li>
  ` : '';

  resultContent.innerHTML = `
    ${statusHtml}
    <div class="result-main">
      <div class="result-main__label">${d.zakatDue > 0 ? 'Итоговая сумма закята' : 'Закят не обязателен'}</div>
      <div class="${amountClass}">${amountText}</div>
    </div>
    <ul class="result-breakdown">
      ${rows}
      ${harvestRows}
      ${subtotalRows}
    </ul>
  `;
}

// Слушатели
goldPriceInput.addEventListener('input', () => {
  updateNisabDisplay();
  updateGoldHint();
});

silverPriceInput.addEventListener('input', () => {
  updateNisabDisplay();
  updateSilverHint();
});

nisabToggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    nisabStandard = btn.dataset.standard;
    nisabToggleBtns.forEach(b => b.classList.remove('nisab-toggle__btn--active'));
    btn.classList.add('nisab-toggle__btn--active');
    updateNisabDisplay();
  });
});

harvestBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    harvestRate = parseFloat(btn.dataset.rate);
    harvestBtns.forEach(b => b.classList.remove('harvest-btn--active'));
    btn.classList.add('harvest-btn--active');
  });
});

goldInput.addEventListener('input', updateGoldHint);
silverInput.addEventListener('input', updateSilverHint);

calcBtn.addEventListener('click', calculate);

// Считать по Enter в любом поле
document.querySelectorAll('.input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculate();
  });
});

// FAQ аккордеон
document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // закрыть все
    document.querySelectorAll('.faq__q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // открыть кликнутый (если был закрыт)
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// Smooth scroll для навигации
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Инициализация
updateNisabDisplay();
