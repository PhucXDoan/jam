onload = () =>
{
    const ctx        = document.querySelector('canvas').getContext('2d');
    let   delta_time = null;
    let   time       = null;

    const lerp = (a, b, t) => a * (1 - t) + b * t
    const damp = (a, b, k) => lerp(a, b, k * delta_time)

    const render = () =>
    {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let x = Math.sin(time * 0.01) * 50;

        ctx.fillStyle = 'green';
        ctx.fillRect(x, 10, 150, 100);
    };

    const RESIZING_DONE_PIXEL_THRESHOLD = 6
    const RESIZING_DAMPENING            = 0.015
    let   resize_id                     = null;
    let   resizing                      = true;

    onresize = () =>
    {
        clearTimeout(resize_id);
        resize_id = setTimeout(() => (resizing = true), 250);
    };

    const wrapper = new_time =>
    {
        delta_time = new_time - (time ?? new_time);
        time       = new_time;

        if (resizing)
        {
            if
            (
                Math.abs(ctx.canvas.width  - innerWidth ) < RESIZING_DONE_PIXEL_THRESHOLD &&
                Math.abs(ctx.canvas.height - innerHeight) < RESIZING_DONE_PIXEL_THRESHOLD
            )
            {
                ctx.canvas.width  = innerWidth;
                ctx.canvas.height = innerHeight;
                resizing          = false;
            }
            else
            {
                ctx.canvas.width  = damp(ctx.canvas.width , innerWidth , RESIZING_DAMPENING);
                ctx.canvas.height = damp(ctx.canvas.height, innerHeight, RESIZING_DAMPENING);
            }
        }

        render();

        requestAnimationFrame(wrapper);
    };

    requestAnimationFrame(wrapper);
};
