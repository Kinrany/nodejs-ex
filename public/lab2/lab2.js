let questionsJsonUrl = "questions.json";
let dataDeferred = $.getJSON(questionsJsonUrl);

let inputQuestionTemplate;
let inputForm;

$(document).ready(function () {
    inputQuestionTemplate = $("#input-question-template").html();
    inputForm = $("#input-form");
    
    dataDeferred.done(loadQuestions).done(function() {
        $.post("submitForm", "hello world");
    });
});

function loadQuestions(data) {
    const {questions} = data;

    for (let qi = 0; qi < questions.length; ++qi) {
        let { question, answers } = questions[qi];
        appendQuestion(inputForm, question, answers);
    }

    // http://materializecss.com/forms.html#select-initialization
    $('select').material_select();
}

function appendQuestion(parent, question, answers) {
    parent.append(inputQuestionTemplate);
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
