    var noUiSliderDecorator;

    noUiSliderDecorator = function (node, type) {
        console.log(node);

        var ractive = node._ractive.root;
        var setting = false;
        var observer;

        var options = {};
        if (type) {
            if (!noUiSliderDecorator.type.hasOwnProperty(type)) {
                throw new Error( 'Ractive noUiSlider type "' + type + '" is not defined!' );
            }

            options = noUiSliderDecorator.type[type];
            if (typeof options === 'function') {
                options = options.call(this, node);
            }
        }

        var sliderNode = document.createElement('div');
        node.parentNode.insertBefore(sliderNode, node.nextSibling);
        noUiSlider.create(sliderNode, options);

        // Push changes from ractive to noUiSlider
        if (node._ractive.binding) {
            observer = ractive.observe(node._ractive.binding.keypath.str, function (newvalue) {
                if (!setting) {
                    setting = true;
                    window.setTimeout(function () {
                        sliderNode.noUiSlider.set(newvalue);
                        setting = false;
                    }, 0);
                }
            });
        }

        // Pull changes from noUiSlider to ractive
        sliderNode.noUiSlider.on('change', function (value) {
            if (!setting) {
                setting = true;
                ractive.set(node._ractive.binding.keypath.str, value);
                setting = false;
            }
        });

        return {
            teardown: function () {
                node.noUiSlider.destroy();

                if (observer) {
                    observer.cancel();
                }
            }
        };
    };

    noUiSliderDecorator.type = {};


