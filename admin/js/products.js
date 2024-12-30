const fileInput = document.querySelector('input[type="file"]');
const imagePreviewContainer = document.querySelector(".image-preview");
const { accessToken, refreshToken } = JSON.parse(localStorage.getItem("token"));
console.log(accessToken, refreshToken);
fileInput.addEventListener("change", function () {
  const files = fileInput.files;

  imagePreviewContainer.innerHTML = ""; // Clear existing previews

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.margin = "5px";
      imagePreviewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

const showPopup = (message, success = true) => {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");

  popupMessage.textContent = message;
  popup.style.backgroundColor = success ? "#4caf50" : "#f44336"; // Green for success, red for error

  popup.classList.remove("hidden");
  popup.classList.add("visible");

  setTimeout(() => {
    popup.classList.remove("visible");
    popup.classList.add("hidden");
  }, 3000); // Hide after 3 seconds
};

const getdata = async (event) => {
  const formData = new FormData(event.target);
  const dataObject = {};
  dataObject.color = ["black"];

  formData.forEach((value, key) => {
    if (key === "size[]") {
      if (!dataObject.size) {
        dataObject.size = [];
      }
      dataObject.size.push(value);
    } else if (key === "images[]") {
      dataObject.image = value; // Handle image field
    } else {
      dataObject[key] = value;
    }
  });

  if (dataObject.price) dataObject.price = parseFloat(dataObject.price);
  if (dataObject.appliedDiscount)
    dataObject.appliedDiscount = parseFloat(dataObject.appliedDiscount);
  if (dataObject.stock) dataObject.stock = parseInt(dataObject.stock, 10);

  console.log(dataObject);
  return dataObject;
};

const sendData = async (dataObject) => {
  const formData = new FormData();
  formData.append("color", ["black"]);
  for (const key in dataObject) {
    if (key === "image") {
      formData.append(key, dataObject[key]);
    } else if (Array.isArray(dataObject[key])) {
      dataObject[key].forEach((value) => formData.append(key, value));
    } else {
      formData.append(key, dataObject[key]);
    }
  }

  try {
    const response = await fetch(
      "https://mohamed-apis.vercel.app/product/createProduct?categoryId=676fde4b045b16d3a4d4caf2",
      {
        method: "POST",
        body: formData,
        headers: {
          authorization: accessToken ? `Bearer ${accessToken}` : null,
          "refresh-token": refreshToken || null,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      throw new Error("Failed to send data to the API");
    }

    const result = await response.json();
    console.log("API Response:", result);
    showPopup("Product created successfully!", true);
  } catch (error) {
    console.error("Error:", error.message);
    showPopup("An error occurred while sending the data.", false);
  }
};

document
  .getElementById("productForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const product = await getdata(event);
    await sendData(product);
  });
