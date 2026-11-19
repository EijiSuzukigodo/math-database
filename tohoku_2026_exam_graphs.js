(() => {
  const quartic = document.getElementById('quartic');
  if (quartic) {
    const ctx = quartic.getContext('2d');
    const x = value => 320 + 245 * value;
    const y = value => 140 - 420 * value;
    function draw(points, color, width = 2) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (const [index, [u, v]] of points.entries()) {
        if (index === 0) ctx.moveTo(x(u), y(v));
        else ctx.lineTo(x(u), y(v));
      }
      ctx.stroke();
    }
    draw([[-1.25, 0], [1.25, 0]], '#8394a5');
    draw([[0, -0.39], [0, 0.28]], '#8394a5');
    draw([[-1.25, -0.25], [1.25, -0.25]], '#b45309');
    draw(Array.from({length: 241}, (_, i) => {
      const u = (i - 120) / 105;
      return [u, u ** 4 - u ** 2];
    }), '#176cae', 4);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#31465e';
    ctx.fillText('x', x(1.25), y(0) - 8);
    ctx.fillText('y', x(0) + 8, y(0.28));
    ctx.fillText('0', x(0) + 8, y(0) - 8);
    ctx.fillText('−1/4', x(0) + 8, y(-0.25) + 19);
    for (const u of [-1, 1]) ctx.fillText(String(u), x(u) - 7, y(0) + 20);
  }

  const slider = document.getElementById('ellipse-a');
  if (slider) {
    const ctx = document.getElementById('ellipse-graph').getContext('2d');
    const output = document.getElementById('ellipse-value');
    const x = value => 320 + 145 * value;
    const y = value => 175 - 145 * value;
    function drawEllipse() {
      const a = Number(slider.value);
      output.value = a.toFixed(2);
      ctx.clearRect(0, 0, 640, 350);
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const t = i * Math.PI / 120;
        const px = x(Math.cos(t) ** 3);
        const py = y(Math.sin(t) ** 3);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#dbeeff';
      ctx.fill();
      ctx.strokeStyle = '#176cae';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#8394a5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x(-1.2), y(0));
      ctx.lineTo(x(1.2), y(0));
      ctx.moveTo(x(0), y(-1.12));
      ctx.lineTo(x(0), y(1.12));
      ctx.stroke();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (a === 0) {
        ctx.moveTo(x(0), y(-1));
        ctx.lineTo(x(0), y(1));
      } else if (a === 1) {
        ctx.moveTo(x(-1), y(0));
        ctx.lineTo(x(1), y(0));
      } else {
        ctx.ellipse(x(0), y(0), 145 * a, 145 * (1 - a), 0, 0, 2 * Math.PI);
      }
      ctx.stroke();

      ctx.fillStyle = '#1d2939';
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(x(sx * a ** 1.5), y(sy * (1 - a) ** 1.5), 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.font = '16px sans-serif';
      ctx.fillText('x', x(1.2) + 7, y(0) + 5);
      ctx.fillText('y', x(0) + 8, y(1.12));
    }
    slider.addEventListener('input', drawEllipse);
    drawEllipse();
  }
})();
