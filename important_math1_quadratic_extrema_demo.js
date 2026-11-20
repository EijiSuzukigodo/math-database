(() => {
  const format = value => String(Math.round(value * 100) / 100);
  const plot = { left: 36, right: 422, top: 22, bottom: 256 };
  const X = x => plot.left + (x + 2) * (plot.right - plot.left) / 8;
  const Y = y => plot.bottom - y * 19.5;
  const color = { grid: '#e1e8ee', axis: '#63798d', line: '#176cae', min: '#087a62', max: '#a65916' };
  const line = (x1, y1, x2, y2, stroke, width = 1, dash = '') =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="${dash}"/>`;
  const label = (x, y, text, italic = false) =>
    `<text x="${x}" y="${y}" font-size="13" font-style="${italic ? 'italic' : 'normal'}" fill="#354e65">${text}</text>`;
  const point = (x, y, fill, radius) =>
    `<circle cx="${X(x)}" cy="${Y(y)}" r="${radius}" fill="${fill}" stroke="#fff" stroke-width="1.8"/>`;

  function results(a, movingParabola) {
    const left = movingParabola ? 0 : a;
    const right = movingParabola ? 2 : a + 2;
    const axis = movingParabola ? a : 2;
    const f = x => (x - axis) ** 2 + 1;
    const minIndex = a < 0 ? 0 : a > 2 ? 2 : 1;
    const maxIndex = a < 1 ? 0 : a > 1 ? 2 : 1;
    const minimumX = Math.max(left, Math.min(right, axis));
    const endpoint = x => x === left ? '左端' : '右端';
    const minPlace = axis === minimumX
      ? (axis === left || axis === right ? '頂点（' + endpoint(axis) + '）' : '頂点')
      : endpoint(minimumX);
    const maximumXs = maxIndex === 1 ? [left, right] : [f(left) > f(right) ? left : right];
    const maxPlace = maximumXs.length === 2 ? '両端' : maximumXs[0] === left ? '左端' : '右端';
    return { left, right, axis, f, minIndex, maxIndex, minimumX, maximumXs, minPlace, maxPlace };
  }

  function drawGraph(svg, id, state) {
    const { left, right, axis, f, minimumX, maximumXs } = state;
    const floor = plot.bottom;
    const path = (from, to, stroke, width) => {
      const coordinates = Array.from({ length: 81 }, (_, i) => {
        const x = from + (to - from) * i / 80;
        return (i ? 'L' : 'M') + X(x) + ' ' + Y(f(x));
      }).join(' ');
      return `<path d="${coordinates}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
    };
    let picture = `<defs><clipPath id="${id}"><rect x="${plot.left}" y="${plot.top}" width="${plot.right - plot.left}" height="${floor - plot.top}"/></clipPath></defs>`;
    picture += `<rect x="${X(left)}" y="${plot.top}" width="${X(right) - X(left)}" height="${floor - plot.top}" fill="#e1f0fa"/>`;
    for (let x = -2; x <= 6; x++) {
      picture += line(X(x), plot.top, X(x), floor, color.grid) + label(X(x) - 6, floor + 19, x);
    }
    for (let y = 0; y <= 12; y += 2) {
      picture += line(plot.left, Y(y), plot.right, Y(y), color.grid) + label(8, Y(y) + 4, y);
    }
    picture += line(X(0), plot.top, X(0), floor, color.axis, 1.3);
    picture += line(plot.left, floor, plot.right, floor, color.axis, 1.3);
    picture += line(X(axis), plot.top, X(axis), floor, color.axis, 1.4, '5 4');
    picture += `<g clip-path="url(#${id})">` + path(-2, 6, '#aab7c5', 2) + path(left, right, color.line, 3.5);
    picture += point(left, f(left), color.line, 4) + point(right, f(right), color.line, 4);
    picture += point(minimumX, f(minimumX), color.min, 6);
    for (const x of maximumXs) picture += point(x, f(x), color.max, 6);
    svg.innerHTML = picture + '</g>' + label(X(axis) + 6, 16, '軸 x = ' + format(axis))
      + label(421, 292, 'x', true) + label(17, 17, 'y', true);
  }

  function setMath(element, tex, fallback) {
    const mathJax = window.MathJax;
    if (typeof mathJax?.tex2chtml === 'function' && mathJax.startup.document) {
      element.replaceChildren(mathJax.tex2chtml(tex, {display: false}));
    } else {
      element.textContent = fallback;
    }
  }

  function setValue(output, f, points) {
    const value = document.createElement('strong');
    const number = format(f(points[0]));
    const locations = points.map(format).join(', ');
    setMath(value, number, number);
    const coordinates = document.createElement('span');
    setMath(coordinates, 'x=' + locations, 'x = ' + locations);
    output.replaceChildren(value, '（', coordinates, '）');
  }

  for (const panel of document.querySelectorAll('[data-example]')) {
    const movingParabola = panel.dataset.example === 'moving-parabola';
    const find = selector => panel.querySelector(selector);
    const slider = find('input[type="range"]');
    const play = find('[data-play]');
    const graph = find('[data-graph]');
    const minimum = find('[data-minimum]');
    const maximum = find('[data-maximum]');
    const sliderValue = find('[data-slider-value]');
    const formula = find('[data-current-formula]');
    const reason = find('[data-reason]');
    const rowIds = movingParabola ? ['moving-parabola-min-', 'moving-parabola-max-'] : ['m', 'M'];
    let timer = null;

    function draw() {
      const a = Number(slider.value);
      const state = results(a, movingParabola);
      const { left, right, axis, f, minimumX, maximumXs, minIndex, maxIndex, minPlace, maxPlace } = state;
      setMath(sliderValue, format(a), format(a));
      const interval = document.createElement('span');
      const symmetryAxis = document.createElement('span');
      setMath(interval, format(left) + '\\leqq x\\leqq ' + format(right), format(left) + ' ≦ x ≦ ' + format(right));
      setMath(symmetryAxis, 'x=' + format(axis), 'x = ' + format(axis));
      formula.replaceChildren(interval, '　／　軸 ', symmetryAxis);
      drawGraph(graph, panel.dataset.example + '-clip', state);
      setValue(minimum, f, [minimumX]);
      setValue(maximum, f, maximumXs);
      reason.textContent = minPlace + 'で最小、' + maxPlace + 'で最大になります。';
      rowIds.forEach((id, index) => {
        const selected = index === 0 ? minIndex : maxIndex;
        for (let i = 0; i < 3; i++) {
          const row = document.getElementById(id + i);
          row.classList.toggle('active', i === selected);
          if (i === selected) row.setAttribute('aria-current', 'true');
          else row.removeAttribute('aria-current');
        }
      });
    }
    function stop() {
      if (timer !== null) clearInterval(timer);
      timer = null;
      play.textContent = '自動移動';
    }
    function jump(value) {
      stop();
      slider.value = value;
      draw();
    }
    slider.addEventListener('input', () => { stop(); draw(); });
    play.addEventListener('click', () => {
      if (timer !== null) { stop(); return; }
      if (Number(slider.value) >= Number(slider.max)) slider.value = slider.min;
      draw();
      play.textContent = '停止';
      timer = setInterval(() => {
        const next = Number(slider.value) + Number(slider.step);
        slider.value = String(Math.min(Number(slider.max), Math.round(next * 10) / 10));
        draw();
        if (slider.value === slider.max) stop();
      }, 160);
    });
    find('[data-reset]').addEventListener('click', () => jump(slider.defaultValue));
    for (const button of panel.querySelectorAll('[data-boundary]')) {
      button.addEventListener('click', () => jump(button.dataset.boundary));
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
    });
    draw();
    window.MathJax?.startup?.promise?.then(draw, () => {});
  }
})();
