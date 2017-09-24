let questionsJsonUrl = "questions.json";
let dataPromise = $.getJSON(questionsJsonUrl);

$(document).ready(function () {
    dataPromise.done(loadQuestions);
});

function loadQuestions(data) {
    const {questions} = data;

    const inputQuestionTemplate = $("#input-question-template").html();
    const inputQuestionList = $("#input-question-list");

    for (let qi = 0; qi < questions.length; ++qi) {
        let { question, answers } = questions[qi];

        inputQuestionList.append(inputQuestionTemplate);
        let inputQuestionItem = inputQuestionList
            .children(".input-question-item:last-child");

        inputQuestionItem.find(".input-question-label").text(question);

        let inputQuestionSelect = inputQuestionItem.find(".input-question-select");
        for (let ai = 0; ai < answers.length; ++ai) {
            let option = $("<option>");
            option.text(answers[ai]);
            option.appendTo(inputQuestionSelect);
        }
    }
}