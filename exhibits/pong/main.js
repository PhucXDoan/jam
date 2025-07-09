let ball_pos_x = ctx.canvas.width  / 2;
let ball_pos_y = ctx.canvas.height / 2;

const update = () =>
{
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.arc(ball_pos_x, ball_pos_y, geolen(0.01), 0, Math.PI * 2);
    ctx.fill();
};