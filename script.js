const GEMINI_API_KEY = 'AIzaSyB4jJjZ3U89Aohq1tsuPhCA61tfE_eBDps';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

const GEMINI_CHARACTER_PROMPT_SCAFFOLDING = `The user has submitted three input text fields for an existing fictional character in the form {"character_name": ring, "source_material": string, "release_date": int}. 

Your task and ONLY task is to, based on this input, estimate this fictional character's Big 5/BFAS personality traits based on what you know about the fictional character.

Output ONLY a JSON object with this exact format: 
{
    "openness/intellect": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "conscientiousness": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "extraversion": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "agreeableness": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "emotional stability": {"score": 0.0, "confidence": 0.0, "reasoning": string}
}
Do NOT output any other text.

Additional rules:
(1) If the character name field is not filled out, then you must output a score of "-1.0" for each Big 5 dimension, and you then must output "0.0" for confidence and "N/A" for reasoning. 

(2) Note that technically only the character name field is required to be filled out, if the character in question is either well known enough or if their name is specific/unique enough. (For instance, "Walter White" is instantly recognizable as being from Breaking Bad without needing to fill out the source material and release year fields.) However, at other times, due to insufficient number of JSON fields filled out, the specific fictional character the user is referring to might be ambiguous (there could be multiple fictional characters satisfying the filled out properties). If you deem it ambiguous, based on the paucity of fields filled out so far, then you must output a score of "-1.0" for each Big 5 dimension, and you then must output "0.0" for confidence and "N/A" for reasoning, because this character is then not analyzeable because you don't even know who they are. 

(3) If the character specified by the user just doesn't exist in any published fictional media (literature/books, movies, TV series, anime, comics) based on your knowledge, then you must output a score of "-1.0" for each Big 5 dimension, and you then must output "0.0" for confidence and "N/A" for reasoning, because this character is then not analyzeable because you don't even know who they are, regardless of whether all three input fields are filled out or not. 

(4) If and only if a score estimate is available for each dimension (i.e. the character specified exists in some published fictional media, AND is unambiguously/uniquely specified), make your estimated scores for each dimension range from 0.0 (lowest) to 100.0 (highest) and output that in the "score" property. Output your relative confidence level (from 0.0 (lowest confidence) to 100.0 (highest confidence) in giving that fictional character that score for each dimension in the "confidence" property of each dimension.

(5) For the reasoning property of each Big 5 trait (the "reasoning" property of the JSON object), make your response directed in third-person perspective (to the character in question, addressing whoever their name is), and cite reasons specific to/catered to the character's personality as portrayed in their corresponding fictional media/source material (i.e. the book/show/movie they're in). Avoid being too harsh or too effusive, and please keep your tone neutral. Keep your reasoning for your assignment of each Big 5 trait around 50 to 75 words. 

Here is the user's input character JSON object to analyze:`;


const GEMINI_PROMPT_SCAFFOLDING = `Analyze the following response (in text-form) to the question "Describe yourself, or a recent experience in your life, in at least 200 words" submitted by the user and provide your estimated Big Five personality scores.

Output ONLY a JSON object with this exact format: 
{
    "openness/intellect": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "conscientiousness": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "extraversion": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "agreeableness": {"score": 0.0, "confidence": 0.0, "reasoning": string},
    "emotional stability": {"score": 0.0, "confidence": 0.0, "reasoning": string}
}
Do not output any other text.

Additional rules:
(1) If the user has entered less than 150 words, output a score of "-1.0" for each dimension, and you then must output "0.0" for confidence and "N/A" for reasoning, since this would be too little text to analyze.

(2) If the user's response is off-topic (in other words, it's about a topic completely unrelated to them as person, say, about their friend or about the newest brand of coffee), also output a score of "-1.0" for each dimension, and you then must output "0.0" for confidence and "N/A" for reasoning, since then this text is not analyzable in terms of personality. 

(3) If and only if a score estimate is available for each dimension, make your estimated scores for each dimension range from 0.0 (lowest) to 100.0 (highest) and output that in the "score" property. Output your relative confidence level (from 0.0 (lowest confidence) to 100.0 (highest confidence) in giving the user that score for each dimension in the "confidence" property of each dimension.

(4) For the reasoning property of each Big 5 trait (the "reasoning" property of the JSON object), make your response directed in second-person perspective (to "you"), and cite reasons specific to/catered to the text response the user entered in deciding the scores. Avoid being too harsh or too effusive, please keep your tone neutral. Keep your reasoning for your assignment of each Big 5 trait around 30 to 50 words. 

Here is the user's response to analyze:`;

const DIMENSIONS = ["Openness/Intellect","Conscientiousness","Extraversion","Agreeableness","Emotional Stability"];
const ITEMS = [
  { id: "O1", dimension: "Openness/Intellect", text: "I avoid reading challenging material", negative: true },
  { id: "O2", dimension: "Openness/Intellect",  text: "I rarely follow news about politics, culture, or world events.", negative: true  },
  { id: "O3", dimension: "Openness/Intellect",  text: "I am knowledgeable on many different subjects", negative: false  },
  { id: "O4", dimension: "Openness/Intellect",  text: "I have sophisticated tastes in art, music, or literature", negative: false  },
  { id: "O5", dimension: "Openness/Intellect",  text: "I seldom daydream", negative: true  },

  { id: "C1", dimension: "Conscientiousness", text: "I follow a schedule", negative: false },
  { id: "C2", dimension: "Conscientiousness", text: "I often postpone decisions", negative: true },
  { id: "C3", dimension: "Conscientiousness", text: "I often don't know what I'm doing", negative: true },
  { id: "C4", dimension: "Conscientiousness", text: "I would like things to be just right", negative: false },
  { id: "C5", dimension: "Conscientiousness", text: "I ensure that the rules are followed", negative: false },

  { id: "E1", dimension: "Extraversion", text: "I see myself as a good leader", negative: false },
  { id: "E2", dimension: "Extraversion", text: "I keep others at a distance", negative: true },
  { id: "E3", dimension: "Extraversion", text: "I laugh a lot", negative: false },
  { id: "E4", dimension: "Extraversion", text: "I am hard to get to know", negative: true },
  { id: "E5", dimension: "Extraversion", text: "I am not good at captivating people", negative: true },

  { id: "A1", dimension: "Agreeableness", text: "I feel others' emotions.", negative: false },
  { id: "A2", dimension: "Agreeableness", text: "I am not interested in others' problems.", negative: true },
  { id: "A3", dimension: "Agreeableness", text: "I like to do things for others.", negative: false },
  { id: "A4", dimension: "Agreeableness", text: "I believe I am better than others.", negative: true },
  { id: "A5", dimension: "Agreeableness", text: "I respect authority.", negative: false },

  { id: "N1", dimension: "Emotional Stability", text: "I seldom feel blue", negative: false },
  { id: "N2", dimension: "Emotional Stability", text: "I stay calm under pressure.", negative: false },
  { id: "N3", dimension: "Emotional Stability", text: "I change my mood a lot.", negative: true },
  { id: "N4", dimension: "Emotional Stability", text: "I get irritated easily.", negative: true },
  { id: "N5", dimension: "Emotional Stability", text: "I am comfortable with my current self.", negative: false },



];
const SCALE = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Somewhat Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Somewhat Agree" },
  { value: 5, label: "Strongly Agree" }
];

const form = document.getElementById("big-5-form");
const itemsArray = document.getElementById("big-5-items");
const resultsDisplay = document.getElementById("big-5-results");
const resetButton = document.getElementById("reset-button");

const textInputForm = document.getElementById("input-form");
const userResponseText = document.getElementById("user-response-text");
const textInputResultsDisplay = document.getElementById("input-results");
const textInputClearButton = document.getElementById("input-reset-button");

const characterInputForm = document.getElementById("character-analysis-form");
const characterNameField = document.getElementById("character-name-field");
const characterSourceField = document.getElementById("character-source-field");
const characterReleaseYearField = document.getElementById("character-release-year-field");
const characterPersonalityResultsDisplay = document.getElementById("character-analysis-results");
const characterInputFormSubmitButton = document.getElementById("character-analyze-button");
const characterInputFormResetButton = document.getElementById("character-reset-button");



function renderItems() {
  itemsArray.innerHTML = ITEMS.map((item) => {
    const questionName = `Question ${item.id}`;
    const likertButtons = SCALE.map(button => `
      <label>
        <input type="radio" name="${questionName}" value="${button.value}" />
        <span>${button.label}</span>
      </label>
    `).join("");
    return `
      <li>
        <fieldset>
           <legend>${item.text}</legend>
          <div class="scale" role="radiogroup" aria-label="${questionName}">
            ${likertButtons}
          </div>
        </fieldset>
      </li>
    `;
  }).join("");
}

function computeScores(formData) {
    dimensionSums = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));
    dimensionCounts = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));

    for (const item of ITEMS) {
        if (formData.get(`Question ${item.id}`) == null) {
            continue;
        }
        else {
            rawValue = Number(formData.get(`Question ${item.id}`));
            scaledValue = 0;
            if (item.negative) {
                scaledValue = 6 - rawValue;
            }
            else {
                scaledValue = rawValue;
            }
            dimensionSums[item.dimension] += scaledValue;
            dimensionCounts[item.dimension] += 1;
        }

    }
    existsUnanswered = false;
    for (const dim of DIMENSIONS) {
        if (dimensionCounts[dim] < 5) {
            existsUnanswered = true
        }
    }
    if (existsUnanswered) {
        return {error: "Please answer all 25 questions in order see your results."};
    }
    else {
        scaledScores = Object.fromEntries(DIMENSIONS.map(t => [t, 0]));
        for (const dim of DIMENSIONS) {
            scaledScores[dim] = Math.round(100 * ((dimensionSums[dim] / dimensionCounts[dim]) - 1) / 4.0);
            
        }
        return { scaledScores };
    }




}

function displayScores(scaledScores) {
resultsDisplay.innerHTML = DIMENSIONS.map(d => {

    comment = "";
    if (scaledScores[d] >= 90) 
        comment = " (Very High)";
    
    else if (scaledScores[d] >= 75 && scaledScores[d] < 90) 
        comment = " (High)";

    else if (scaledScores[d] >= 60 && scaledScores[d] < 75) 
        comment = " (Somewhat High)";
    
    else if (scaledScores[d] > 40 && scaledScores[d] < 60) 
        comment = " (Neutral)";
    
    else if (scaledScores[d] > 25 && scaledScores[d] <= 40) 
        comment = " (Somewhat Low)";
    
    else if (scaledScores[d] > 10 && scaledScores[d] <= 25) 
        comment = " (Low)";
    
    else if (scaledScores[d] >=0 && scaledScores[d] <= 10) 
        comment = " (Very Low)";
    
    return `
      <div class="dimension score display">${d}: ${scaledScores[d]} percent${comment}</div>
    `;
  }).join("\n");
}


async function analyzePersonality(userResponse) {
    try {
        const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
            parts: [{
                text: `${GEMINI_PROMPT_SCAFFOLDING}\n\n${userResponse}`
            }]
            }]
        })
        });
    if (!geminiResponse.ok) {
        throw new Error(`Gemini API error due to ${geminiResponse.status}`);
    }
    const data = await geminiResponse.json();
    const geminiOutput = data.candidates[0].content.parts[0].text;

    let cleanedOutput = geminiOutput.replace(/```json|```/g, '').trim();
    console.log("gemini output: " + cleanedOutput);
    let personalityData;
    try {
        personalityData = JSON.parse(cleanedOutput);
    } 
    catch (parseError) {
        console.error('Failed to parse AI output as JSON object');
        return {
            isValid: false,
            data: null,
            error: 'Failed to parse AI output as JSON object'
        };
    }
    //check if the user's personality response is valid (i.e. on-topic and long enough)
    const valid = personalityData["agreeableness"] && personalityData["agreeableness"].score !== -1.0;

    if (!valid) {
        console.error("not valid");
        return {
            isValid: false,
            data: personalityData,
            error: "Sorry, but your response was too short (< 200 words) or off-topic."
        };
    }
    else {
        return {
            isValid: true,
            data: personalityData
        };
    }

    } catch (error) {
        console.error('Error analyzing personality due to ', error);
        return {
            isValid: false,
            data: null,
            error: error.message
        };
    }
}

async function analyzeCharacterPersonality(characterInput) /* this is a JSON object from the form */
{
    try {
        const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
            parts: [{
                text: `${GEMINI_CHARACTER_PROMPT_SCAFFOLDING}\n\n${JSON.stringify(characterInput)}`
            }]
            }]
        })
        });
    if (!geminiResponse.ok) {
        throw new Error(`Gemini API error due to ${geminiResponse.status}`);
    }
    const data = await geminiResponse.json();
    const geminiOutput = data.candidates[0].content.parts[0].text;

    let cleanedOutput = geminiOutput.replace(/```json|```/g, '').trim();
    if (!cleanedOutput.endsWith('}')) {
        cleanedOutput += '}';
    }
    

    console.log("gemini output: " + cleanedOutput);
    let personalityData;
    try {
        personalityData = JSON.parse(cleanedOutput);
    } 
    catch (parseError) {
        console.error('Failed to parse AI output as JSON object');
        return {
            isValid: false,
            data: null,
            error: 'Failed to parse AI output as JSON object'
        };
    }
    //check if the AI's personality response is valid (i.e. on-topic and long enough)
    const valid = personalityData["agreeableness"] && personalityData["agreeableness"].score !== -1.0;

    if (!valid) {
        console.error("not valid");
        return {
            isValid: false,
            data: personalityData,
            error: "Sorry, but we couldn't find your character. Your input character was either nonsensical/doesn't exist or too ambiguous (try specifying the source material and/or release year!)"
        };
    }
    else {
        return {
            isValid: true,
            data: personalityData
        };
    }

    } catch (error) {
        console.error('Error analyzing character personality due to ', error);
        return {
            isValid: false,
            data: null,
            error: error.message
        };
    }
}

function displayBig5JSON(big5json) {
    if (!big5json.isValid) {
        textInputResultsDisplay.innerHTML = big5json.error;
        return;
    }
    else {
        const data = big5json.data;
        textInputResultsDisplay.innerHTML = `
            <h3>Your personality analysis results (powered by Gemini)</h3>
            ${Object.entries(data).map(([dimension, info]) => `
                <div class="big-5-dimension-result">
                    <strong>Your ${dimension}:</strong> ${info.score} %${getComment(info.score)}
                    (Confidence: ${info.confidence}%)<br>
                    <i>Reasoning: ${info.reasoning}</i>
                </div>
            `).join('')}
        `;
    }
}

function displayCharacterBig5JSON(big5json) {
    if (!big5json.isValid) {
        characterPersonalityResultsDisplay.innerHTML = big5json.error;
        return;
    }
    else {
        const data = big5json.data;
        characterPersonalityResultsDisplay.innerHTML = `
            <h3>${characterNameField.value}'s personality analysis results (powered by Gemini)</h3>
            ${Object.entries(data).map(([dimension, info]) => `
                <div class="big-5-dimension-result">
                    <strong>${dimension}:</strong> ${info.score} %${getComment(info.score)}
                    (Confidence: ${info.confidence}%)<br>
                    <i>Reasoning: ${info.reasoning}</i>
                </div>
            `).join('')}
        `;
    }
}

function getComment(score) //helper function 
{ 
    comment = "";
    if (score >= 90) 
        comment = " (Very High)";
    
    else if (score >= 75 && score < 90) 
        comment = " (High)";

    else if (score >= 60 && score < 75) 
        comment = " (Somewhat High)";
    
    else if (score > 40 && score < 60) 
        comment = " (Neutral)";
    
    else if (score > 25 && score <= 40) 
        comment = " (Somewhat Low)";
    
    else if (score > 10 && score <= 25) 
        comment = " (Low)";
    
    else if (score >=0 && score <= 10) 
        comment = " (Very Low)";

    return comment;
}

document.addEventListener("DOMContentLoaded", () => {
  renderItems();

  //testGeminiAPI();

  form.addEventListener("submit", (event) => {
        event.preventDefault();
        out = computeScores(new FormData(form));
        resultsDisplay.hidden = false;
        if (out.error) {
            resultsDisplay.innerHTML = "Error Submitting Form. Please make sure all questions are answered.";
        }
        displayScores(out.scaledScores);
  });

  resetButton.addEventListener("click", () => {
        resultsDisplay.hidden = true;
        resultsDisplay.innerHTML = "";
        form.reset();
  });

  textInputForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        textInputResultsDisplay.hidden = false;
        textInputResultsDisplay.innerHTML = "Awaiting Response from Gemini API... Hang tight!";
        output = await analyzePersonality(userResponseText.value);
        if (output.error) {
            textInputResultsDisplay.innerHTML = output.error;
        }
        displayBig5JSON(output);

  });

  textInputClearButton.addEventListener("click", () => {
    textInputResultsDisplay.hidden = true;
    textInputResultsDisplay.innerHTML = "";
    textInputForm.reset();
  });

  characterInputForm.addEventListener("submit", async(event) => {
    event.preventDefault();
    characterPersonalityResultsDisplay.hidden = false;
    characterPersonalityResultsDisplay.innerHTML = "Awaiting Response from Gemini API... Hang tight!";
    const characterInfo = {
        character_name: characterNameField.value,
        source_material: characterSourceField.value,
        release_year: characterReleaseYearField.value
    }
    output = await analyzeCharacterPersonality(characterInfo);
    if (output.error) {
        characterPersonalityResultsDisplay.innerHTML = output.error;
    }
    displayCharacterBig5JSON(output);

  });

  characterInputFormResetButton.addEventListener("click", () => {
    characterPersonalityResultsDisplay.hidden = true;
    characterPersonalityResultsDisplay.innerHTML = "";
    characterInputForm.reset();
  });

  //add more event listeners for the text input
});


