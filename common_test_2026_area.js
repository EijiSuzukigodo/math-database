(() => {
  const slider = document.getElementById('level');
  const graph = document.getElementById('cubic-area');
  const ctx = graph.getContext('2d');
  const level = document.getElementById('level-value');
  const difference = document.getElementById('area-difference');
  const balanced = -11 / 12;
  const px = x => 50 + 580 * x;
  const py = y => 163 - 103 * y;

  function draw(k) {
    const f = x => x ** 3 / 3 - 2 * x ** 2 + 3 * x + k;
    let left = 0;
    let right = 1;
    for (let i = 0; i < 32; i++) {
      const midpoint = (left + right) / 2;
      if (f(midpoint) < 0) left = midpoint;
      else right = midpoint;
    }
    const root = (left + right) / 2;

    ctx.clearRect(0, 0, graph.width, graph.height);
    for (const [start, end, color] of [[0, root, '#fce0ba'], [root, 1, '#cde9fc']]) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(px(start), py(0));
      for (let i = 0; i <= 80; i++) {
        const x = start + (end - start) * i / 80;
        ctx.lineTo(px(x), py(f(x)));
      }
      ctx.lineTo(px(end), py(0));
      ctx.fill();
    }

    ctx.strokeStyle = '#63798d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px(-0.05), py(0));
    ctx.lineTo(px(1.05), py(0));
    ctx.moveTo(px(0), py(-1.4));
    ctx.lineTo(px(0), py(1.4));
    ctx.stroke();

    ctx.strokeStyle = '#176cae';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px(0), py(f(0)));
    for (let i = 1; i <= 160; i++) {
      const x = i / 160;
      ctx.lineTo(px(x), py(f(x)));
    }
    ctx.stroke();

    ctx.fillStyle = '#17365d';
    ctx.font = '16px sans-serif';
    ctx.fillText('0', px(0) - 17, py(0) + 19);
    ctx.fillText('1', px(1) - 4, py(0) + 19);
    ctx.fillText('x', px(1.05), py(0) - 7);
    ctx.fillText('y', px(0) + 8, py(1.4));
    level.value = k === balanced ? '−11/12' : k.toFixed(3);
    difference.value = (k - balanced).toFixed(3);
  }

  slider.addEventListener('input', () => draw(Number(slider.value)));
  document.getElementById('equal-areas').addEventListener('click', () => {
    slider.value = balanced.toFixed(3);
    draw(balanced);
  });
  draw(balanced);
})();
