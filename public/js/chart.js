// Docs: https://www.chartjs.org/docs/latest/

var termColors;
window.addEventListener('load', () => {
    const style = getComputedStyle(document.documentElement);
    termColors = {
        black: style.getPropertyValue('--c-black'),
        white: style.getPropertyValue('--c-white'),
        grey: style.getPropertyValue('--c-grey'),
        purple: style.getPropertyValue('--c-purple'),
        fuschia: style.getPropertyValue('--c-fuschia'),
        blue: style.getPropertyValue('--c-blue'),
        green: style.getPropertyValue('--c-green'),
        orange: style.getPropertyValue('--c-orange'),
        yellow: style.getPropertyValue('--c-yellow'),
        red: style.getPropertyValue('--c-red'),

        font: style.getPropertyValue('--font-color'),
        bg: style.getPropertyValue('--bg'),
    };

    Chart.defaults.color = termColors.font;
    Chart.defaults.borderColor = termColors.grey + '33';

    // TODO remove points in each value
 
    // addCmd2Term('chart');
    // addChart2term(createChart(
    //     [
    //         '16-12', '17-12', '18-12', '19-12', '20-12', '21-12', '22-12', '23-12',
    //         '24-12', '25-12', '26-12', '27-12', '28-12', '29-12', '30-12'
    //     ],
    //     [
    //         {
    //             name: 'Hours of activity',
    //             data: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 11, 0],
    //             color: termColors.blue
    //         },
    //         {
    //             name: 'Corrections',
    //             data: [0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
    //             color: termColors.orange
    //         },
    //         {
    //             name: 'Events',
    //             data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    //             color: termColors.green
    //         }
    //     ]
    // ));
});

function createChart(xdata, fts) {
    let datasets = [];
    for (let i = 0; i < fts.length; i++) {
        datasets.push({
            label: fts[i].name,
            data: fts[i].data,
            backgroundColor: fts[i].color + '88',
            borderColor: fts[i].color,
            pointStyle: 'false',
            fill: true,
            tension: 0.4,
            borderWidth: 2
        });
    }

    return {
        type: 'line',
        data: {
            labels: xdata,
            datasets
        },
        options: {
            plugins: {
                customCanvasBackgroundColor: {
                    color: termColors.bg,
                }
            }
        },
        plugins: [
            {
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart, args, options) => {
                  const {ctx} = chart;
                  ctx.save();
                  ctx.globalCompositeOperation = 'destination-over';
                  ctx.fillStyle = options.color || '#99ffff';
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                }
            }
        ],
    };
}