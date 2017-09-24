$(document).ready(function () {
    var inputForm = $('#input-form');
    var inputField = $('#input-field');
    var inputErrorLabel = $('#input-error-label');
    var outputList = $('#output-list');
    var outputCount = $('#output-count');
    var outputElementTemplate = $('#output-element-template');

    function showErrorMessage() {
        inputErrorLabel.toggleClass("hide", false);
    }

    function hideErrorMessage() {
        inputErrorLabel.toggleClass("hide", true);
    }

    function addOutput(inputNumber) {
        console.assert(typeof (number) === "number");

        var element = $(outputElementTemplate.html());
        element.text(inputNumber);
        element.appendTo(outputList);
    }

    function handleInput(inputString) {
        var inputNumber = +inputString;
        if ($.trim(inputString) == "" || isNaN(inputNumber)) {
            showErrorMessage();
        } else {
            hideErrorMessage();
            addOutput(inputNumber);
        }
    }

    inputForm.on('submit', function () {
        var inputString = inputField.val();
        inputField.val("");
        handleInput(inputString);
        return false;
    });

    outputList.on('DOMNodeInserted DOMNodeRemoved', function () {
        var numbers = outputList.children('.output-element').length;
        outputCount.text(numbers);
    });
});