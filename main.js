onload = () =>
{
    const ctx  = document.querySelector('canvas').getContext('2d');
    let   time = null;

    const render = delta_time =>
    {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let x = Math.sin(time * 0.01) * 50;

        ctx.fillStyle = 'green';
        ctx.fillRect(x, 10, 150, 100);
    };

    let resize_id  = null;
    let is_resized = false;

    onresize = () =>
    {
        clearTimeout(resize_id);
        resize_id = setTimeout(() => (is_resized = true), 250);
    };

    const wrapper = new_time =>
    {

        if (is_resized)
        {
            ctx.canvas.width  = innerWidth;
            ctx.canvas.height = innerHeight;
            is_resized        = false;
        }
        else
        {
            render(new_time - (time ?? new_time));
        }

        time = new_time;

        requestAnimationFrame(wrapper);
    };

    requestAnimationFrame(wrapper);
};
