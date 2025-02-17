const tf = require('@tensorflow/tfjs-node');
var use = require('@tensorflow-models/universal-sentence-encoder');
var natural = require('natural');
var TfIdf = natural.TfIdf;


const winkNLP = require( 'wink-nlp' );
// Load "its" helper to extract item properties.
const its = require( 'wink-nlp/src/its.js' );
// Load "as" reducer helper to reduce a collection.
const as = require( 'wink-nlp/src/as.js' );
// Load english language model — light version.
const wink_model = require( 'wink-eng-lite-model' );
// Instantiate winkNLP.
const nlp = winkNLP( wink_model);

const similarity = require('wink-nlp/utilities/similarity.js');
let SummarizerManager = require("node-summarizer").SummarizerManager;

/////////////////////////////////

const express = require('express');
const formidable = require('formidable');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(cors());
app.use(helmet())
app.use(express.static('public'))


app.get('/', (req, res) =>
  res.send('Paragraph Sentiment and Summarizer Web App ')
);


  app.post('/', (req, res) => {
  let allArrays = new Array;   
  const form = formidable();
  //options.maxFieldsSize
  form.options.maxFieldsSize = 500000;

  

let htmlstr = `<h2>Semantic Cyclone AI Document Similarity Results</h2><h4><a href="/">[Try Again]</a></h4>

<table>
  <tr>
    <th>Analytic Measurement</th>
    <th>Document 1</th>
    <th>Document 2</th>
  </tr>
   <tr>
    <td>AI Similarity Summary</td>
     <td colspan="2">`;


  form.parse(req, (err, fields) => {
    if (err) {
      return;
    }
    if (fields.message1 == '' || fields.message2 == '') {
      res.send('Submission Error, the Documents must not empty... ');
      return;
    }

    if (containsAnyLetters(fields.message1)) {

    } else {

      res.send('Submission Error, the Documents must contain english text... ');
      return;
    }

    if (containsAnyLetters(fields.message2)) {

    } else {

      res.send('Submission Error, the Documents must contain English text... ');
      return;
    }

 
    
    let bio1_dat = '';
    let bio2_dat = '';

    //strip potentially malicious characters from input for saftey purposes
    let frstBio = fields.message1;
    let secndBio = fields.message2; 
    frstBio = frstBio.replace(/[;()']/g,'');
    secndBio = secndBio.replace(/[;()']/g,'');

    // console.log('POST body:', fields);
    console.log('\First Bio Text: ' + fields.message1);
    console.log('\nSecond Bio Text: ' + fields.message2);
    console.log('\First Bio Text2: ' + frstBio);
    console.log('\nSecond Bio Text2: ' + secndBio);

    ////Fetch Top 4 Sentances and Sentiment for first Bio
    let Summarizer = new SummarizerManager(frstBio,4); 
    let bio1_summary = Summarizer.getSummaryByFrequency().summary;
    bio1_dat = bio1_dat + '<p> Doc1 Top 4 Selected Summary Sentances: ' + bio1_summary;
    let bio1_sentiment = Summarizer.getSentiment();
    var bio1_sentrslt = bio1_sentiment.toFixed(2);
    var bio1_senttxt = '';
    if (bio1_sentiment > 0) {
        bio1_senttxt = "Positive";
    } else if (bio1_sentiment < 0 ) {
        bio1_senttxt = "Negative";
    } else if (bio1_sentiment == 0) {
        bio1_senttxt = "Neutral";
    }
    bio1_dat = bio1_dat + '<p> Doc1 Sentiment: ' + bio1_senttxt + ' ' + bio1_sentrslt + '% ' ;
   ////End Fetch Top 4 Sentances for First Bio

   ////Fetch Top 4 Sentances for Second Bio
   var Summarizer2 = new SummarizerManager(secndBio,4); 
   var bio2_summary = Summarizer2.getSummaryByFrequency().summary;
   bio2_dat = bio2_dat + '<p>Doc2 Top 4 Selected Summary Sentances: ' + bio2_summary;
   var bio2_sentiment = Summarizer2.getSentiment();
   var bio2_sentrslt = bio2_sentiment.toFixed(2);
       var bio2_senttxt = '';
       if (bio2_sentiment > 0) {
           bio2_senttxt = "Positive";
       } else if (bio2_sentiment < 0 ) {
           bio2_senttxt = "Negative";
       } else if (bio2_sentiment == 0) {
           bio2_senttxt = "Neutral";
       }
       bio2_dat = bio2_dat + '<p> Doc2 Sentiment: ' + bio2_senttxt + ' ' + bio2_sentrslt + '% ' ;
   ////End Fetch Top 4 Sentances for Second Bio


   //// Derive Sentiment Difference

   let sent_senttxt = '';
   
   if (bio2_senttxt == "Positive" && bio1_senttxt == "Positive") {
    sent_senttxt = "Both Positive";
   } else if (bio2_senttxt == "Negative" && bio1_senttxt == "Negative") {
    sent_senttxt = " Both Negative";
   } else {
    sent_senttxt = "Split Sentiment";
   }

   console.log('Seniment Difference: ' + sent_senttxt);

   ///// Get Tokens for doc1

   let tfidf = new TfIdf();
    tfidf.addDocument(frstBio);
    let ctr = 0;
    let tokctr = 0;
    let tokarr = [];
    let tokstr = '';


    console.log("\n Stemming Token List \n")
    tfidf.listTerms(0 /*document index*/).forEach(function(item) {
        ctr++;
        if (ctr < 1000) {
            tokctr++;
            tokstr = tokstr + ' ' + item.term ;
            tokarr.push(item.term);
        }
    });
allArrays.push(tokarr);

   ////End Get Tokens for Doc1

   ///// Get Tokens for doc2


   let tfidf2 = new TfIdf();
    tfidf2.addDocument(secndBio);
    let ctr2 = 0;
    let tokctr2 = 0;
    let tokarr2 = [];
    let tokstr2 = '';


    console.log("\n Stemming  Second Doc Token List \n")
    tfidf2.listTerms(0 /*document index*/).forEach(function(item) {
        ctr2++;
        if (ctr2 < 500) {
            tokctr2++;
            tokstr2 = tokstr2 + ' ' + item.term ;
            tokarr2.push(item.term);
        }
    });
allArrays.push(tokarr2);
   ////End Get Tokens for Doc2

   ///// Get Common Tokens in both doc1 and doc2

   console.log('comparing arrs: ' + allArrays[0] + '\n and \n' + allArrays[1] + '\n\n')

   let filteredArray = allArrays[0].filter(value => allArrays[1].includes(value));
   console.log('common words between Docs 1 & 2' + filteredArray);
   console.log(filteredArray);
   let commTokCtr = filteredArray.length;
   ////End Get Common Tokens in both doc1 and doc2

   ///////Get Raw Cosine Similarity
 const doc1 = nlp.readDoc(frstBio);
 const doc2 = nlp.readDoc(secndBio);
 // Obtain the bow of a document.
 let bow1 = doc1.tokens().out(its.value, as.bow);
 // Obtain the set of a document.
 let set1 = doc1.tokens().out(its.value, as.set);
 // Obtain the bow of a document.
 let bow2 = doc2.tokens().out(its.value, as.bow);
 // Obtain the set of a document.
 let set2 = doc2.tokens().out(its.value, as.set);
 let similRating = similarity.bow.cosine(bow1, bow2);

    let rndRspnVal = Math.round((similRating * 100));

    if (rndRspnVal > 100) { rndRspnVal = rndRspnVal + ' (Near/Exact Match)'}

    let cos_similarity =  rndRspnVal + '% ' ;
    let final_cosSim = rndRspnVal;
    console.log('Document 1 & 2 Cosine Similarity: '  + frstBio.slice(0, 12) + ' and ' + secndBio.slice(0, 12) + ' ' + similRating + ' Rounded: ' + rndRspnVal);
 /////End Get Raw Cosine Similaryty




    (async() => {
        
      let bio1_sum_length = countWords(bio1_summary);
      let bio2_sum_length = countWords(bio2_summary);
      let bio1_total_length = countWords(frstBio);
      let bio2_total_length = countWords(secndBio);
      bio1_dat = bio1_dat + ' <p>Doc1 Total Tokenized Words: ' + bio1_total_length + ' Doc1 Summary Number of Tokenized Words: ' + bio1_sum_length;
      bio2_dat = bio2_dat + ' <p>Doc2 Total Tokenized Words: ' + bio2_total_length + ' Doc2 Summary Number of Tokenized Words: ' + bio2_sum_length;
    
      console.log('----Start---------------');
        
      use.load().then(model => {
    
          const sentences = [
            bio1_summary,
            bio2_summary
          ];
          console.log('Processing Input summaries: ' +  bio1_summary + '\n <-> \n' + bio2_summary + ' \n ' );
          console.log('Doc1 Total Length: ' + bio1_total_length + ' Tokens'); 
          console.log('Doc2 Total Length: ' + bio2_total_length + ' Tokens'); 
          console.log('Doc1 Summary Length: ' + bio1_sum_length + ' Tokens'); 
          console.log('Doc2 Summary Length: ' + bio2_sum_length + ' Tokens'); 



        model.embed(sentences).then(async embeddings => {
            let vec = await embeddings.array();
            let cosine = tf.losses.cosineDistance(vec[0], vec[1], 0);
            let result = await cosine.data();
            let final_rspsval =  `${Math.round((1 - result) * 100)}`;
            let rspsval = `${Math.round((1 - result) * 100)}%`;
                if (result == 0) { result = result + ' (Near/Exact Match)';}   

            //fetch basic AI response - include other vars in future iterations

            let ai_responseObj = '';

            console.log('Final CosineSimiliarity: '+ final_cosSim )
            console.log('Final Select Sentc Similiarity: '+ final_rspsval )

            if ((final_cosSim > 0) && (final_cosSim < 75)  && (final_rspsval > 0) && (final_rspsval < 35)   ) {

              ai_responseObj = 'Submitted Texts are Very Semantically Different ';
              console.log('Submitted Texts are Very Semantically Different')

            } else if ((final_cosSim > 74) && (final_cosSim < 79) && (final_rspsval > 34) && (final_rspsval < 68) ) {

              ai_responseObj = 'Submitted Texts are Semantically Different ';
              console.log('Submitted Texts are Semantically Different')

            }else if ((final_cosSim > 79) && (final_cosSim < 100) && (final_rspsval > 67) && (final_rspsval < 100) ) {

              ai_responseObj = 'Submitted Texts are Semantically Similar ';
              console.log('Submitted Texts are Semantically Similar')

            }else {

              ai_responseObj = 'Submitted Texts Do Not Match Any Similarity Model (likely not semantically related) ';
              console.log('Submitted Texts Do Not Match Any Similarity Model (likely not semantically related)')

            }

            


            //// Fetch AI Similarity Summary
            htmlstr = htmlstr + `${ai_responseObj}</td></tr>`;

            //// Fetch Total Cosine Similarty
            htmlstr = htmlstr + `  <tr>
            <td>Total Cosine Similarity</td>
             <td colspan="2">${cos_similarity}</td>
          </tr>`;
          //// Fetch Selected Key Sentances Semantic Similarity (ML)

          htmlstr = htmlstr + `<tr>
          <td>Selected Key Sentances Semantic Similarity (ML)</td>
           <td colspan="2">${rspsval}</td>
        </tr>`;

          //// Fetch Each Document's Sentiment

          htmlstr = htmlstr + `<tr>
          <td>Document Sentiment</td>
          <td>${bio1_senttxt} ${bio1_sentrslt}%</td>
          <td>${bio2_senttxt} ${bio2_sentrslt}%</td>
        </tr>`;

          //// Fecth Total Tokenized Words

          htmlstr = htmlstr + ` <tr>
          <td>Total Tokenized Words</td>
          <td>${bio1_total_length}</td>
          <td>${bio2_total_length}</td>
        </tr>`;

          //// Fetch Selected Key Sentance Tokens

          htmlstr = htmlstr + ` <tr>
          <td>Selected Key Sentance Tokens</td>
          <td>${bio1_sum_length}</td>
          <td>${bio2_sum_length}</td>
        </tr>`;


          //// Fetch Tokenized Key Words Found In both Docs

          htmlstr = htmlstr + `  <tr>
          <td>Number of Keywords Found In both Docs</td>
           <td colspan="2">${commTokCtr}</td>
        </tr>`;

          //// Fetch Tokenized Keywords Found In both Docs

          htmlstr = htmlstr + `  <tr>
          <td>Common Keywords Found In both Docs</td>
          <td colspan="2">${filteredArray}</td>
       </tr>`;

          //// Fetch Selected Key Sentances

          htmlstr = htmlstr + `  <tr>
          <td>Selected Key Sentances</td>
          <td>${bio1_summary}</td>
          <td>${bio2_summary}</td>
        </tr>
      </table><p><h4>Submitted Data Below: </h4><p>`;

            res.send(htmlstr);


            console.log('Summary Sentances Similarity: '+ rspsval + ' Result: '+ result + cos_similarity);
            console.log('----End------------\n');

          });
        });

  })();
    
  });
});  

const PORT = process.env.PORT || 8080;
console.log('The value of PORT is:', process.env.PORT);
console.log(process.env);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);

/////////////////////////////////

function containsAnyLetters(str) {


  try {

    //  return /[a-zA-Z]/.test(str);

    return /[a-zA-Z]+\s+[a-zA-Z]+/g.test(str);

  } catch(e) {

    console.log(e);
  }
}

function countWords(str) {

  try {
    const arr = str.split(' ');

    return arr.filter(word => word !== '').length;
} catch(e) {

  console.log(e);
  return 0;

}

}




