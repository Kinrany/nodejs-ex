const questionsJsonUrl = "questions.json";
const dataDeferred = $.getJSON(questionsJsonUrl);

// global namespace for jQuery objects
const $g = {
    inputQuestionTemplate: undefined,
    inputForm: undefined,
    inputQuestions: undefined,
    inputDownloadingLabel: undefined
};

$(document).ready(function () {
    $g.inputQuestionTemplate = $("#input-question-template");
    $g.inputForm = $("#input-form");
    $g.inputQuestions = $("#input-questions");
    $g.inputDownloadingLabel = $g.inputForm.find('.hide-on-form-load');
    
    dataDeferred.done(loadQuestions).done(function () {
        $g.inputForm.find("button").click(submitForm);
    });
});

function submitForm() {
    $.post("submitForm", "hello world");
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
console.log($g.inputDownloadingLabel);
}

function appendQuestion(parent, question, answers) {
    parent.append($g.inputQuestionTemplate.html());
    let questionItem = parent.children(".input-question-item:last-child");

    questionItem.find(".input-question-label").text(question);

    let questionSelect = questionItem.find(".input-question-select");

    appendOptionDefault(questionSelect, "Выберите вариант");
    
    for (let ai = 0; ai < answers.length; ++ai) {
        appendOption(questionSelect, answers[ai]);
    }
}

function appendOption(parent, answer) {
    let option = $("<option>");
    option.text(answer);
    option.appendTo(parent);
    return option;
}

function appendOptionDefault(parent, answer) {
    let option = appendOption(parent, answer);
    option.addClass('disabled selected');
}
