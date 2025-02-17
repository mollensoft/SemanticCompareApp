const myForm = document.getElementById('my-form');

var url = '/';


myForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(myForm);
  formData.append('user', true);
  const response = await fetch(url, {
    method: 'post',
    body: formData
  });
  const result = await response.text();
  document.getElementById("response").innerHTML = result;
  console.log(result);
});