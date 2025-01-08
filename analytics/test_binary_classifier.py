import cv2
import numpy as np
import onnxruntime



class Gaze_Inference:
    def __init__(self):


        onnx_model_path = 'models_1/best_model_4_grayscale_256.onnx'  # The ONNX model path #W
        self.session = onnxruntime.InferenceSession(onnx_model_path,  providers = ['CUDAExecutionProvider']) #W

        # Get input and output names for the ONNX model
        self.input_name = self.session.get_inputs()[0].name #W
        self.output_name = self.session.get_outputs()[0].name #W

        input_shape = self.session.get_inputs()[0].shape
        input_shape = [dim if isinstance(dim, int) else 1 for dim in input_shape]

        dummy_input = np.random.randn(*input_shape).astype(np.float32)
        try:
            _ = self.session.run(None, {self.input_name: dummy_input})
            print("Warmup session run Successfully")
        except:
            print("Warmup session did not run successfully")
        print(f"Loaded ONNX model from {onnx_model_path}") #W
        print(f"Input name: {self.input_name}") #W
        print(f"Output name: {self.output_name}") #W

        self.heatmap = []
    
    def preprocess_image(self, img, target_size=(224, 224)):
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.resize(img, target_size)
        img_array = img.astype(np.float32)  #W # ONNX requires float32 format
        img_array = np.expand_dims(img_array, axis=0)  #W # Add batch dimension valid for both keras and onnx models
        img_array = np.expand_dims(img_array, axis=-1) #W # Add batch dimension valid for only onnx models
        img_array /= 255.0  # Normalize pixel values
        return img_array

    def fix_val(self, c, my_min, my_max):
        if c>my_max:
            return my_max
        elif c<my_min:
            return my_min
        else:
            return c

    def get_inference(self, frame, head_bbox):
        image = frame.copy()

        x_min = head_bbox[0]
        y_min = head_bbox[1]
        x_max = head_bbox[2] 
        y_max = head_bbox[3] 

        # add 30% padding
        x_min -= 0.1 * abs(x_max - x_min)
        y_min -= 0.1 * abs(y_max - y_min)
        x_max += 0.1 * abs(x_max - x_min)
        y_max += 0.1 * abs(y_max - y_min)

        # bounding box validation to fix it inside the image 
        y_min = self.fix_val(y_min,0,image.shape[0])
        y_max = self.fix_val(y_max,0,image.shape[0])
        x_min = self.fix_val(x_min,0,image.shape[1])
        x_max = self.fix_val(x_max,0,image.shape[1])

        # image slicing
        head = image[int(y_min):int(y_max), int(x_min):int(x_max)]
        head_processed = self.preprocess_image(head)

        # Make prediction
        # prediction = self.model.predict(head_processed) #for keras model prediction
        prediction = self.session.run([self.output_name], {self.input_name: head_processed})[0]
        # Interpret the prediction based on your model's output
        if prediction[0][0] > 0.5:
            return 1
        else:
            return 0

        