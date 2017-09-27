const questionsJsonUrl = "questions.json";
const dataDeferred = $.getJSON(questionsJsonUrl);

// global namespace for jQuery objects
const $g = {
    load: function() {
        $g.inputQuestionTemplate = $("#input-question-template");
        $g.inputForm = $("#input-form");
        $g.inputQuestions = $("#input-questions");
        $g.inputDownloadingLabel = $g.inputForm.find('.hide-on-form-load');
        $g.inputNameField = $("#input-name");
    }
};

$(document).ready(function () {
    $g.load();
    
    dataDeferred.done(loadQuestions).done(function () {
        $g.inputForm.find("button").click(submitForm);
    });
});

function submitForm() {
    let jsonData = {name: $g.inputNameField.val(), answers: []};
    $g.inputForm.find('select').map((i, e) => {
        jsonData.answers[i] = $(e).val();
    });

    $.post("submitForm", jsonData, function success() {
            console.log("Success.");
            $('#success-label').toggleClass('hide', true);
            $('#failure-label').toggleClass('hide', false);
        })
        .fail(function() {
            console.log("Error.");
            $('#success-label').toggleClass('hide', false);
            $('#failure-label').toggleClass('hide', true);
        });
    console.log("Form posted: " + JSON.stringify(jsonData));
}

function loadQuestions(data) {
    const {questions} = data;

    for (let qi = 0; qi < questions.length; ++qi) {
        let { question, answers } = questions[qi];
        appendQuestion($g.inputQuestions, question, answers);
    }

    // http://materializecss.com/forms.html#select-initialization
    $('select').material_select();

    $g.inputDownloadingLabel.addClass('hide');
}

function appendQuestion(parent, question, answers) {
    parent.append($g.inputQuestionTemplate.html());
    let questionItem = parent.children(".input-question-item:last-child");

    questionItem.find(".input-question-label").text(question);

    let questionSelect = questionItem.find(".input-question-select");

    appendOptionDefault(questionSelect, "Выберите вариант");
    
    for (let ai = 0; ai < answers.length; ++ai) {
        appendOption(questionSelect, answers[ai], ai);
    }
}

function appendOption(parent, answer, value) {
    let option = $("<option>");
    option.text(answer);
    option.val(value);
    option.appendTo(parent);
    return option;
}

function appendOptionDefault(parent, answer, value) {
    let option = appendOption(parent, answer, value);
    option.addClass('disabled selected');
}
