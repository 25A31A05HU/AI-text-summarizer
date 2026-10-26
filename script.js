// Common stop words to ignore during word frequency calculation
const stopWords = new Set(["the", "is", "at", "which", "and", "a", "an", "in", "to", "of", "it", "for", "on", "with", "as", "this", "that", "by", "from", "be", "or", "are", "was", "were"]);

function generateSummary() {
    let text = document.getElementById("inputText").value.trim();
    let targetCount = parseInt(document.getElementById("sentenceCount").value, 10);

    if (!text) {
        alert("Please enter some text to summarize!");
        return;
    }

    // Step 1: Split text into individual sentences securely (with fallback for unpunctuated endings)
    let sentences = text.match(/[^.!?]+[.!?]+/g);
    if (!sentences) {
        // Fallback split by newlines or periods if standard punctuation match fails
        sentences = text.split(/(?<=[.!?])\s+|\n+/).filter(s => s.trim().length > 0);
    }

    if (!sentences || sentences.length <= targetCount) {
        document.getElementById("outputSummary").innerText = text;
        document.getElementById("statsArea").innerHTML = "Text is already short enough!";
        return;
    }

    // Step 2: HASH MAP - Count word frequencies across the whole document
    let wordFreq = {};
    let words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    
    words.forEach(word => {
        if (!stopWords.has(word)) {
            // Increment count in our Hash Map
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // Step 3: PRIORITY QUEUE / HEAP SIMULATION - Score each sentence based on word importance
    let scoredSentences = sentences.map((sentence, index) => {
        let sWords = sentence.toLowerCase().match(/\b[a-z]+\b/g) || [];
        let score = 0;
        sWords.forEach(word => {
            if (wordFreq[word]) {
                score += wordFreq[word]; // Add up word frequencies
            }
        });
        // Normalize score by sentence length to avoid bias toward long sentences
        let normalizedScore = sWords.length > 0 ? score / sWords.length : 0;
        return { text: sentence.trim(), score: normalizedScore, originalIndex: index };
    });

    // Sort sentences by score in descending order (Simulating Max-Heap extraction)
    scoredSentences.sort((a, b) => b.score - a.score);

    // Step 4: DYNAMIC PROGRAMMING / SIMILARITY CHECK - Remove redundant sentences
    let finalSummary = [];
    for (let candidate of scoredSentences) {
        if (finalSummary.length >= targetCount) break;

        let isRedundant = false;
        // Check similarity with already chosen sentences (Jaccard similarity logic)
        for (let chosen of finalSummary) {
            if (calculateSimilarity(candidate.text, chosen.text) > 0.4) {
                isRedundant = true; // Too similar, skip it!
                break;
            }
        }

        if (!isRedundant) {
            finalSummary.push(candidate);
        }
    }

    // Step 5: Sort selected sentences back to their original order in the text so it reads naturally
    finalSummary.sort((a, b) => a.originalIndex - b.originalIndex);

    // Display result
    let summaryText = finalSummary.map(s => s.text).join(" ");
    document.getElementById("outputSummary").innerText = summaryText;
    document.getElementById("statsArea").innerHTML = `Original Sentences: <span>${sentences.length}</span> | Summarized Sentences: <span>${finalSummary.length}</span>`;
}

// Helper function: Calculate word overlap similarity between two sentences (Jaccard similarity index)
function calculateSimilarity(sent1, sent2) {
    let set1 = new Set(sent1.toLowerCase().match(/\b[a-z]+\b/g) || []);
    let set2 = new Set(sent2.toLowerCase().match(/\b[a-z]+\b/g) || []);
    
    let intersection = 0;
    set1.forEach(word => { if (set2.has(word)) intersection++; });
    
    let union = new Set([...set1, ...set2]).size;
    return union === 0 ? 0 : intersection / union;
}