import tensorflow as tf
import numpy as np
import cv2
import utils as utils
from math import ceil
from tensorflow.keras.models import load_model
from PIL import Image
import requests
import string
import random
import json


#could add colour signature??.. just an equation?
#speggetttiii code.. need to revise before i show people..

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
  return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def sendPhotos(path):
    model = load_model("./yolov4-model2/")

    image_path = path
    images_data = []

    original_image = cv2.imread(image_path)
    original_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)

    image_data = cv2.resize(original_image, (416, 416))
    image_data = image_data / 255

    for i in range(1):
        images_data.append(image_data)
        images_data = np.asarray(images_data).astype(np.float32)

    infer = model.signatures['serving_default']

    batch_data = tf.constant(images_data)
    pred_bbox = infer(batch_data)

    for key, value in pred_bbox.items():
        boxes = value[:, :, 0:4]
        pred_conf = value[:, :, 4:]

    boxes, scores, classes, valid_detections = tf.image.combined_non_max_suppression(
        boxes=tf.reshape(boxes, (tf.shape(boxes)[0], -1, 1, 4)),
        scores=tf.reshape(pred_conf, (tf.shape(pred_conf)[0], -1, tf.shape(pred_conf)[-1])),
            max_output_size_per_class=15,
            max_total_size=20,
            iou_threshold=.6,
            score_threshold=float('-inf'))



    original_h, original_w, _ = original_image.shape 
    bboxes = utils.format_boxes(boxes.numpy()[0], original_h, original_w)
    pred_bbox = [bboxes, scores.numpy()[0], classes.numpy()[0], valid_detections.numpy()[0]]



    class_names = utils.read_class_names("classes.names")
    allowed_classes = list(class_names.values())
    allowed_classes = ['text', 'graph','image']
    out_boxes, out_scores, out_classes, num_boxes = pred_bbox
    classes = utils.read_class_names("classes.names")

    box_coord = []

    for i in range(num_boxes):
        if out_scores[i] > .1:
            coord = out_boxes[i]
            
            length = coord[2] - coord[0]
            height = coord[3] - coord[1]
            
            area = length * height
            
            if area > 1000:
                box_coord.append(out_boxes[i].tolist())

    box_coordFin = []

    for i in box_coord:
        tempArr = []
        for e, val in enumerate(i):
            if e == 0:
                val = int(i[0]-(i[0]*.2))
            elif e == 2:
                val = int((i[2]*1.2))
            elif e == 3:
                val = int(i[3] * 1.2)
            elif e == 1:
                val = int(i[1]-(i[1]*.2))
            tempArr.append(val)

        box_coordFin.append(tempArr)
    
    cleanImage = np.squeeze(original_image)

    valueArr = []

    #current restriction is a digit under 10
    coordLength = {}
    coordString1 = ""
    coordString2 = ""


    coordArrayStr = {}

    groupsof4 = int(ceil(len(box_coordFin)/4))
    sigLength = {}
    stringValue = {}
    for i in range(groupsof4):
        coordArrayStr[str(i)] = [""]
        coordLength[str(i)] = [""]
        sigLength[str(i)] = [""]
        stringValue[str(i)] = [""]
    


    #now need to determine when to insert to next array

    ######save imageblock#####
    image = utils.draw_bbox(original_image, pred_bbox, False, allowed_classes=allowed_classes)

    image = Image.fromarray(image.astype(np.uint8))
    image = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)
    # change here for diff photo name
    savePhotoAs = "detection.png"
    cv2.imwrite(savePhotoAs, image)
    ######save imageblock#####
    
    counter = 0
    counter4 = 0
    for i in box_coordFin:
        if counter4 == 4:
            counter += 1
            counter4 = 0
        if counter4 < 4:
            ###redundant##
            coordLength[str(counter)][0] = coordLength[str(counter)][0] + str(len(str(i[0]))) + str(len(str(i[2]))) + str(len(str(i[1]))) + str(len(str(i[3])))
            coordArrayStr[str(counter)][0] = coordArrayStr[str(counter)][0] + str(i[0]) + str(i[2]) + str(i[1]) + str(i[3])
            ###redundant##
            ##test 2
            print("test2")
            image = cleanImage[i[1]:i[3],i[0]:i[2], :]
            print(i[1], i[3], i[0], i[2])
            image = np.where(image!=255,image,0)
            image = np.divide(image, 100)
            valu = str(int(round(np.sum(image))))
            print(valu)
            valu = str(int(round(np.sum(image))))
            length = len(valu)
            stringValue[str(counter)][0] = stringValue[str(counter)][0] + valu
            sigLength[str(counter)][0] = sigLength[str(counter)][0] + str(length)
            counter4 += 1

    stringId = id_generator()


    #need to redo this portion... jesus... this part is without compression of 20%
    groupsof4 = int(ceil(len(box_coord)/4))
    coordLength = {}
    coordArrayStr = {}
    for i in range(groupsof4):
        coordArrayStr[str(i)] = [""]
        coordLength[str(i)] = [""]


    counter = 0
    counter4 = 0

    for i in box_coord:
        roundInt0 = int(round(i[0]))
        roundInt1 = int(round(i[1]))
        roundInt2 = int(round(i[2]))
        roundInt3 = int(round(i[3]))
        if counter4 == 4:
            counter += 1
            counter4 = 0
        if counter4 < 4:
            coordLength[str(counter)][0] = coordLength[str(counter)][0] + str(len(str(roundInt0))) + str(len(str(roundInt2))) + str(len(str(roundInt1))) + str(len(str(roundInt3)))
            coordArrayStr[str(counter)][0] = coordArrayStr[str(counter)][0] + str(roundInt0) + str(roundInt2) + str(roundInt1) + str(roundInt3)
            counter4 += 1
    
    stringId = id_generator()

    coorArrayInt = []

    for key, i in coordArrayStr.items():
        coorArrayInt.append(i[0])

    stringArrayInt = []

    for key, i in stringValue.items():
        stringArrayInt.append(i[0])

    sigArrayInt = []

    for key, i in sigLength.items():
        sigArrayInt.append(i[0])

    coordlengthInt = []

    for key, i in coordLength.items():
        coordlengthInt.append(i[0])

    data = {"unprocessedPhoto":path, "savedPhoto":savePhotoAs, "id":stringId, "coordSeq":coordlengthInt, "coords":coorArrayInt, "valueSeq":sigArrayInt, "valuesDoc":stringArrayInt}
    return data



def sendtoBlock(dataRecieved):
    stringId = id_generator()
    data = dataRecieved

    stringId = data["id"]
    coordLength = data["coordSeq"]
    coordArrayStr = data["coords"]
    sigLength = data["valueSeq"]
    stringArrayStr = data["valuesDoc"]

    data = {"id":stringId, "coordSeq":coordLength, 
    "coords":coordArrayStr, "valueSeq":''.join(sigLength), "valuesDoc":stringArrayStr}


    url = 'http://localhost:5123/createdoc'


    x = requests.post(url, headers={'content-type':'application/json'}, json=data)
    # ##need to figure out what is a success from this x
    return x.json()