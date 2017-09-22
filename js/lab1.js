$(document).ready(function () {
    var inputForm = $('#input-form');
    var inputField = $('#input-field');
    var outputList = $('#output-list');
    var outputCount = $('#output-count');
    var outputElementTemplate = $('#output-element-template');

    var inputErrorClass = "input-error";

    function showErrorMessage() {
        inputForm.toggleClass(inputErrorClass, true);
    }

    function hideErrorMessage() {
        inputForm.toggleClass(inputErrorClass, false);
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
        var numbers = outputList.children().length;
        outputCount.text(numbers);
    });
});