var signalScript = document.getElementById('signal-401k-calculator');
var signalCl = {}
signalCl.clientId = signalScript.getAttribute('data-client-id');
var signalbaseUrl = "";
// First we have to configure RequireJS
require.config({
    // This tells RequireJS where to find Ractive and rv
    paths: {
        ractive: signalbaseUrl + 'lib/ractive',
        rv: signalbaseUrl + 'loaders/rv',
        nouislider: signalbaseUrl + 'lib/nouislider',
        chartjs: signalbaseUrl + 'lib/Chart.bundle',
        clientScript: signalbaseUrl + 'lib/' + signalCl.clientId,
        ractiveTooltip: signalbaseUrl + 'lib/decorators/ractive-tooltip'
    },

    // These aren't used during development, but the optimiser will
    // read this config when we run the build script
    name: 'main',
    out: '../../dist/js/main.js',
    stubModules: ['rv']
});

// Now we've configured RequireJS, we can load our dependencies and start
require(['clientScript', 'ractive', 'ractiveTooltip', 'nouislider', 'chartjs', 'rv!templates/maintemplate', ], function(clientScript, Ractive, ractiveTooltip, noUiSlider, chartjs, mainTemplate) {
    'use strict';
    var app = {
        pipsModels: {
            ranges: {
                'employee_salary_slider': {
                    'range': {
                        'min': 0,
                        '33%': 100000,
                        '66%': 200000,
                        'max': 1000000
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.currencyPips(value);
                            },
                        },
                    },
                },
                'employee_current_age_slider': {
                    'range': {
                        'min': 0,
                        '33%': 20,
                        '66%': 40,
                        'max': 60
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.integerPips(value);
                            },
                        }
                    },

                },
                'employee_contribution_slider': {
                    'range': {
                        'min': 0,
                        '33%': 33,
                        '66%': 66,
                        'max': 100
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.percentagePips(value);
                            },
                        }
                    },
                },
                'employee_age_of_retirement_slider': {

                    'range': {
                        'min': 30,
                        '33%': 50,
                        '66%': 70,
                        'max': 90
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.integerPips(value);
                            },
                        }
                    }
                },
                'employee_current_balance_slider': {
                    'range': {
                        'min': 0,
                        '33%': 100000,
                        '66%': 1000000,
                        'max': 10000000
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.currencyPips(value);
                            },
                        }
                    }
                },
                'employee_salary_increase_slider': {
                    'range': {
                        'min': 0,
                        '33%': 33,
                        '66%': 66,
                        'max': 100
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.percentagePips(value);
                            },
                        }
                    },

                },
                'annual_rate_of_return_slider': {
                    'range': {
                        'min': 0,
                        '33%': 33,
                        '66%': 66,
                        'max': 100
                    },
                    'pips': {
                        mode: 'range',
                        density: 4,
                        format: {
                            to: function(value) {
                                return app.percentagePips(value);
                            },
                        }
                    },
                },

            },
        },




        currencyPips: function(value) {

            switch (true) {
                case (value > 999999):
                    value = '$' + Math.floor(value / 1000000) + 'M'
                    break;
                case (value > 999):
                    value = '$' + Math.floor(value / 1000) + 'K'
                    break;
                default:
                    value = '$' + value;

            }
            return value;
        },
        percentagePips: function(value) {

            return value + '%';
        },
        integerPips: function(value) {

            return parseInt(value);
        },
        doesUrlExist: function(url) {
            var request = false;
            if (window.XMLHttpRequest) {
                request = new XMLHttpRequest;
            } else if (window.ActiveXObject) {
                request = new ActiveXObject("Microsoft.XMLHttp");
            }

            if (request) {
                request.open("GET", url);
                if (request.status == 200) {
                    return true;
                }
            }

            return false;
        },
        loadCss: function(url) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        },


        format_integer: function(num) {
            var newVal = parseInt(num).toFixed(0);
            return newVal;
        },
        parse_integer: function(num) {
            var newVal = parseInt(num).toFixed(0);
            return newVal;
        },

        format_percentage: function(num) {
            // var	newVal= (parseFloat(num)).toFixed(2);
            var newVal = (parseFloat(num).toFixed(0));
            newVal = newVal.replace(/\.$/, "");
            newVal += '%';
            return newVal;
        },
        parse_percentage: function(cval) {
            var newVal = parseFloat(cval.replace(/[%,]/g, '')) / 100;
            return newVal;
        },
        key_limit_percentage: function(key) {
            var regex = /^[0-9.,%]+$/;
            if (!regex.test(key)) {
                return false;
            } else {
                return true;
            }
        },
        format_currency: function(num) {
            num = parseFloat(num).toFixed(0);
            return '$'.concat(num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
        },

        key_limit_currency: function(char) {
            [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", ",", "$"].includes(char);

        },

        format_currency_round: function(num) {
            num = parseFloat(num);
            num = num.toFixed(0);
            return '$'.concat(num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
        },
        error_validate_currency: function(str) {
            // Decimal and commas optional
            var errPatt = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/;
            var regtest = errPatt.test(str);
            if (regtest) {
                return true;
            } else {
                return "Please only enter Numeric Characters or one of the following  '$', '.', ','"
            }

        },
        error_validate_currency_round: function(str) {
            // Decimal and commas optional
            var errPatt = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/;
            var regtest = errPatt.test(str);
            if (regtest) {
                return true;
            } else {
                return "Please only enter Numeric Characters or one of the following  '$', '.', ','"
            }

        },

        error_validate_percentage: function(str) {
            // Decimal and commas optional
            var errPatt = /(?=.*?\d)^(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?\%?$/;
            var regtest = errPatt.test(str);
            if (regtest) {
                return true;
            } else {
                return "Please only enter Numeric Characters to 2 decimal places or one of the following  '%', '.',"
            }

        },

        error_validate_age: function(curr, ret) {
            // Decimal and commas optional
            if (curr > ret) {
                return "Retirement age must be greater than current age";
            }

        },
        parse_currency: function(cval) {
            return parseFloat(cval.replace(/[$,]/g, ''));
        },
        parse_currency_round: function(cval) {
            cval = parseFloat(cval.replace(/[$,]/g, ''));
            cval = cval.toFixed(0);
            return cval;
        },
        toggle: function(elem, classTarget) {
            elem.classList.toggle(classTarget);
        },
        hasClass: function(elem, className) {
            return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
        },

        addClass: function(element, name) {
            var arr;
            arr = element.className.split(" ");
            if (arr.indexOf(name) == -1) {
                element.className += " " + name;
            }
        },

        removeClass: function(element, name) {
            element.className = element.className.replace(name, "");
        },

        renderSlider: function() {
            Object.keys(app.sliders).forEach(function(key) {

                if (app.sliders[key].sliderEl.hasAttribute('data-model-target')) {
                    var options = {
                        connect: [true, true],

                    };


                    if (app.pipsModels.ranges[key]) {
                        options['pips'] = app.pipsModels.ranges[key].pips;
                    } else {
                    }
                    var range = {};
                    if (app.pipsModels.ranges[key]) {
                        range = app.pipsModels.ranges[key].range;
                    } else {

                        if (app.sliders[key].sliderEl.hasAttribute('data-min')) {
                            range['min'] = parseInt(app.sliders[key].sliderEl.getAttribute('data-min'));
                        }
                        if (app.sliders[key].sliderEl.hasAttribute('data-max')) {
                            range['max'] = parseInt(app.sliders[key].sliderEl.getAttribute('data-max'));
                        }
                    }
                    options['range'] = range;

                    if (app.sliders[key].sliderEl.hasAttribute('data-default')) {
                        app.mainView.set(app.sliders[key].sliderEl.getAttribute('data-model-target'),
                            app["parse_" + app.sliders[key].sliderEl.getAttribute('data-type')](app.sliders[key].sliderEl.getAttribute('data-default')));



                        options['start'] = parseInt(app.sliders[key].sliderEl.getAttribute('data-default'));

                    }
                    if (app.sliders[key].sliderEl.hasAttribute('data-step')) {
                        options['step'] = parseInt(app.sliders[key].sliderEl.getAttribute('data-step'));
                    }


                    noUiSlider.create(app.sliders[key].sliderEl, options, true);

                    app.sliders[key].sliderEl.noUiSlider.on('update', function(values, handle) {
                        app.removeClass(app.sliders[key].mask.parentNode, "active");
                        app.removeClass(app.sliders[key].mask.parentNode, "error");



                        if (app.sliders[key].sliderEl.hasAttribute('data-type')) {
                            app.sliders[key].mask.value = app["format_" + app.sliders[key].sliderEl.getAttribute('data-type')](values[handle]);
                        }

                        if (app.sliders[key].sliderEl.hasAttribute('data-model-target')) {

                            app.mainView.set(app.sliders[key].sliderEl.getAttribute('data-model-target'),
                                app["parse_" + app.sliders[key].sliderEl.getAttribute('data-type')](values[handle]));

                        }
                        //$(app.sliders[key].sliderEl).find('.noUi-value:visible').removeClass('highlight').eq(maxPos).addClass('highlight');

                    });


                    app.sliders[key].mask.addEventListener('change', function() {
                        var inputEl = this;
                        var tooltip = inputEl.parentNode.getElementsByClassName('tooltip');
                        tooltip = tooltip[0];

                        var targetKey = app.sliders[key].sliderEl.getAttribute('data-model-target');
                        var vType = app.sliders[key].sliderEl.getAttribute('data-type');
                        var maskVal = app.sliders[key].mask.value;
                        var dataVal = app["parse_" + vType](maskVal);

                        var validated = app["error_validate_" + vType](maskVal);

                        if (validated === true) {

                            app.removeClass(inputEl.parentNode, "error");

                            var msg = app.mainView.get('tooltips.' + targetKey);
                            tooltip.textContent = msg;
                            app.sliders[key].sliderEl.noUiSlider.set(maskVal);

                        } else {
                            app.mainView.set('errors.' + targetKey, validated);
                            app.addClass(inputEl.parentNode, "error");
                            var msg = app.mainView.get('errors.' + targetKey);
                            tooltip.textContent = msg;


                            var cdata = JSON.parse(JSON.stringify(app.mainView.get()));
                        };

                    });

                    app.sliders[key].mask.addEventListener('focus', function(evt) {
                        var inputEl = this;
                        inputEl.parentNode.classList.add("active");
                        var tooltip = inputEl.parentNode.getElementsByClassName('tooltip');
                        tooltip = tooltip[0];

                        var targetKey = app.sliders[key].sliderEl.getAttribute('data-model-target');
                        if (inputEl.parentNode.classList.contains('error') === false) {

                            var msg = app.mainView.get('tooltips.' + targetKey);
                            tooltip.textContent = msg;
                        }

                    });

                    app.sliders[key].mask.addEventListener('focusout', function(evt) {
                        var inputEl = this;
                        var targetKey = app.sliders[key].sliderEl.getAttribute('data-model-target');
                        if (inputEl.parentNode.classList.contains('error') === true) {

                            this.parentNode.className.replace(/\active\b/g, "");
                            var tooltip = inputEl.parentNode.getElementsByClassName('tooltip');

                            var msg = app.mainView.get('tooltips.' + targetKey);
                            tooltip.textContent = msg;
                        } else {
                            app.removeClass(inputEl.parentNode, "active");
                        }

                    });


                    app.sliders[key].sliderEl.noUiSlider.on('end', function(values, handle) {


                        var cdata = JSON.parse(JSON.stringify(app.mainView.get()));
                        app.calculate(cdata);

                    });

                    app.sliders[key].sliderEl.noUiSlider.on('set', function(values, handle) {

                        var cdata = JSON.parse(JSON.stringify(app.mainView.get()));
                        app.calculate(cdata);

                    });



                }



            });




        },
        renderSliders: function() {
            app.sliders = {};
            app.masks = {};
            app.sliders.employee_contribution_slider = {
                sliderEl: document.getElementById('401_employee_contribution_slider'),
                mask: document.getElementById('401_employee_contribution'),
            };
            app.sliders.employee_salary_slider = {
                sliderEl: document.getElementById('401_employee_salary_slider'),
                mask: document.getElementById('401_employee_salary'),
            };
            app.sliders.employee_current_balance_slider = {
                sliderEl: document.getElementById('401_employee_current_balance_slider'),
                mask: document.getElementById('401_employee_current_balance'),
            };

            app.sliders.employee_current_age_slider = {
                sliderEl: document.getElementById('401_employee_current_age_slider'),
                mask: document.getElementById('401_employee_current_age'),
            };
            app.sliders.employee_age_of_retirement_slider = {
                sliderEl: document.getElementById('401_employee_age_of_retirement_slider'),
                mask: document.getElementById('401_employee_age_of_retirement'),
            };

            app.sliders.annual_rate_of_return_slider = {
                sliderEl: document.getElementById('401_annual_rate_of_return_slider'),
                mask: document.getElementById('401_annual_rate_of_return'),
            };
            app.sliders.employee_salary_increase_slider = {
                sliderEl: document.getElementById('401_employee_salary_increase_slider'),
                mask: document.getElementById('401_employee_salary_increase'),
            };

            this.renderSlider();

        },

        insertAfter: function(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        },



        init: function() {


            this.loadCss('css/stylesheet.css');
            this.loadCss('css/' + signalCl.clientId + '.css');

            var tempDiv = document.createElement('div');

            var initContainer = signalScript.insertAdjacentElement('beforebegin', tempDiv);
            initContainer.className = "signalContainer";

            this.mainView = new Ractive({
                magic: false,
                el: 'div.signalContainer',
                template: mainTemplate,

                data: {
                    annualContribution: 0,
                    annualSalary: 0,
                    annualSalaryIncrease: 0,
                    currentAge: 0,
                    retirementAge: 0,
                    currentBalance: 0,
                    annualGrowthRate: 0,
                    payment: '',
                    cap: 18500,
                    fcap: 6000,
                    detailedReport: 'empty',
                    tooltips: {
                        annualContribution: 'some tooltip for contributions',
                        annualSalary: 'some tooltip for salary',
                        annualSalaryIncrease: 'some tooltip for salary increase',
                        currentAge: 'some tooltip for age',
                        retirementAge: 'some tooltip for retirement age',
                        currentBalance: 'some tooltip for balance',
                        annualGrowthRate: 'some tooltip for growth rate',
                    },
                    errors: {
                        annualContribution: 'test',
                        annualSalary: '',
                        annualSalaryIncrease: '',
                        currentAge: '',
                        retirementAge: '',
                        currentBalance: '',
                        annualGrowthRate: '',
                    }

                },
                oncomplete: function() {
                    var assumptionToggle = document.getElementById('signal_401_assumption_toggle');

                    assumptionToggle.addEventListener('click', function() {
                        app.toggle(assumptionToggle.parentNode, 'open');
                        app.toggle(assumptionToggle.parentNode, 'closed');
                    });

                    app.renderSliders();

                    var cdata = JSON.parse(JSON.stringify(app.mainView.get()));

                    app.calculate(cdata);

                    customCallback();

                }
            });




        },


        YFV: function(rate, pmt, a, n) {
            var m = Math.pow((1 + rate), (1 / 12)) - 1;

            var fv = ((pmt * (1 + m) * (Math.pow((1 + m), n) - 1)) / m) + a * Math.pow((1 + m), n);

            return fv;
        },


        interpolate_future_value: function(cdata) {
            var futureValues = [];
            var inTdata = {};
            inTdata.chartData = {};
            inTdata.chartData.labels = [];
            inTdata.chartData.balance = [];

            inTdata.chartData.contribution = [];
            inTdata.chartData.labels.push(cdata.currentAge);
            inTdata.chartData.balance.push(cdata.currentBalance);
            inTdata.chartData.contribution.push(cdata.annualSalary * cdata.annualContribution);

            futureValues[0] = {};
            futureValues[0].age = cdata.currentAge;
            futureValues[0].balance = cdata.currentBalance;
            futureValues[0].contribution = 0;
            futureValues[0].annualSalary = cdata.annualSalary;

            for (var y = 1; y <= cdata.term; y++) {

                futureValues[y] = {};
                futureValues[y].age = cdata.currentAge + y;
                if (y == 1) {

                    futureValues[y].annualSalary = cdata.annualSalary;
                } else {
                    futureValues[y].annualSalary = futureValues[y - 1].annualSalary + (futureValues[y - 1].annualSalary * cdata.annualSalaryIncrease);
                }


                futureValues[y].contribution = futureValues[y].annualSalary * cdata.annualContribution;

                var catchup = futureValues[y].age >= 50;

                var tCap = catchup ? (cdata.cap + cdata.fcap) : cdata.cap;

                var contCap = futureValues[y].contribution > tCap;


                futureValues[y].contribution = contCap ? tCap : futureValues[y].contribution;





                var mpt = futureValues[y].contribution / 12;


                var tBalance = this.YFV(cdata.annualGrowthRate, mpt, futureValues[y - 1].balance, 12);



                futureValues[y].balance = tBalance;

                inTdata.chartData.labels.push(futureValues[y].age);
                inTdata.chartData.contribution.push(futureValues[y].contribution);
                inTdata.chartData.balance.push(futureValues[y].balance);

            }
            inTdata.futureValues = futureValues;
            var summary = document.getElementById('signal-result-value');
            summary.innerHTML = '<h3>Results</h3>Your 401(k) could be worth <br /><span class="value big">' + app.format_currency_round(inTdata.chartData.balance[y - 1]) + '</span><br /> in <span class="value">' + cdata.term + '</span> years';
            var summary = document.getElementById('signal-result-value-mob');
            summary.innerHTML = '<h3>Results</h3>Your 401(k) could be worth <br /><span class="value big">' + app.format_currency_round(inTdata.chartData.balance[y - 1]) + '</span><br /> in <span class="value">' + cdata.term + '</span> years';

            return inTdata;
        },

        calculate: function(cdata) {
            cdata.term = cdata.retirementAge - cdata.currentAge;
            cdata.annualSalaryIncrease = cdata.annualSalaryIncrease;
            cdata.annualGrowthRate = cdata.annualGrowthRate;
            cdata.annualContribution = cdata.annualContribution;


            var inTdata = this.interpolate_future_value(cdata);
            this.renderCharts(inTdata);

        },

        renderDetailedReport: function(futureValues) {
            var table = '<table>';
            for (var i = 0; i < futureValues.length;) {
                table += '<tr><td>' + futureValues[i].age + '</td><td>' + futureValues[i].contribution + '</td><td>' + futureValues[i].balance + '</td>';
                i++;
            }
            table += '</table>';

            this.mainView.reset({
                detailedReport: table
            });
        },


        renderCharts: function(inTdata) {

            var ctx = document.getElementById('signal_401_result_chart').getContext('2d');

            var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
            gradientStroke.addColorStop(0, "#0F56A799");
            gradientStroke.addColorStop(1, "#0F56A799");
            if (typeof app.chart === "undefined") {



                app.chart = new Chart(ctx, {
                    type: 'line',
                    responsive: true,
                    // The data for our dataset
                    data: {
                        labels: inTdata.chartData.labels,
                        datasets: [{
                            label: "Balance",
                            borderColor: 'rgb(0, 0, 0, 0)',
                            backgroundColor: gradientStroke,
                            data: inTdata.chartData.balance,
                            pointRadius: 0,
                        }]
                    },

                    // Configuration options go here
                    options: {
                        legend: {
                            display: false
                        },
                        tooltips: {

                            callbacks: {
                                title: function(tooltipItem, data) {

                                    return 'Balance at age ' + data.labels[tooltipItem[0].index];

                                },
                                label: function(tooltipItem, chart) {
                                    return app.format_currency_round(tooltipItem.yLabel);
                                }

                            },
                            mode: 'nearest',
                            intersect: false,
                            backgroundColor: '#FFF',
                            titleFontSize: 12,
                            titleFontColor: '#0066ff',
                            bodyFontColor: '#000',
                            bodyFontSize: 14,
                            displayColors: false,
                            caretSize: 0,
                            cornerRadius: 0,
                            xPadding: 30,
                            yPadding: 30,
                            borderColor: 'rgba(228,226,226,1)',
                            borderWidth: 5,

                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    maxRotation: 0,
                                    maxTicksLimit: 3
                                },
                                afterTickToLabelConversion: function(data) {


                                    var xLabels = data.ticks;
                                    var tickMin = xLabels[0];
                                    var tickMax = xLabels[xLabels.length - 1];

                                    var divt = 10;
                                    if ((tickMax - tickMin) <= 20) {
                                        divt = 5;
                                    }

                                    xLabels.forEach(function(labels, i) {
                                        if (xLabels[i] % divt != 0 && xLabels[i] != tickMin && xLabels[i] != tickMax) {
                                            xLabels[i] = '';
                                        }
                                    });
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Age',
                                    fontSize: 14
                                },
                                gridLines: {
                                    color: "rgba(0, 0, 0, 0)",
                                },

                            }],
                            yAxes: [{
                                gridLines: {
                                    drawBorder: false,
                                },
                                scaleLabel: {
                                    display: false,
                                    labelString: 'Balance'
                                },

                                ticks: {
                                    maxTicksLimit: 5,
                                    callback: function(value, index, values) {
                                        var ranges = [{
                                                divider: 1e6,
                                                suffix: 'M'
                                            },
                                            {
                                                divider: 1e3,
                                                suffix: 'k'
                                            }
                                        ];

                                        function formatNumber(n) {
                                            for (var i = 0; i < ranges.length; i++) {

                                                if (n >= ranges[i].divider) {
                                                    return (n / ranges[i].divider).toString() + ranges[i].suffix;
                                                }

                                            }
                                            return n;
                                        }
                                        return '$' + formatNumber(value);
                                    }


                                },

                            }]
                        }
                    }
                });
            } else {
                app.chart.data.labels.pop();

                app.chart.data.datasets.forEach((dataset) => {
                    dataset.data.pop();
                });

                app.chart.data.labels.push(inTdata.chartData.labels);
                app.chart.data = {
                    labels: inTdata.chartData.labels,
                    datasets: [{
                        label: "Balance",
                        borderColor: 'rgb(0, 0, 0, 0)',
                        backgroundColor: gradientStroke,
                        data: inTdata.chartData.balance,
                        pointRadius: 0,
                    }, {
                        label: "Contributions",
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        borderColor: 'rgba(0, 0, 0, 0)',
                        data: inTdata.chartData.contribution,
                        pointRadius: 0,
                    }]
                }
                app.chart.update();
            }
        },
        calculate_term: function() {}
    }
    app.init();
});
