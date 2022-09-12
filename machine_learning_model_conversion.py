import tensorflow as tf
from absl import flags
from absl.flags import FLAGS
from yolov4 import YOLO, filter_boxes, decode
import utils as utils




def save_tf():
  STRIDES, ANCHORS, NUM_CLASS, XYSCALE = utils.load_config(FLAGS)
  input_size = 416

  weights = 'yolov4-custom_best.weights'
  framework = 'tf'
  output = 'out/'

  input_layer = tf.keras.layers.Input([input_size, input_size, 3])
  feature_maps = YOLO(input_layer, NUM_CLASS)
  bbox_tensors = []
  prob_tensors = []

  for i, fm in enumerate(feature_maps):
    if i == 0:
      output_tensors = decode(fm, input_size // 8, NUM_CLASS, STRIDES, ANCHORS, i, XYSCALE, framework)
    elif i == 1:
      output_tensors = decode(fm, input_size // 16, NUM_CLASS, STRIDES, ANCHORS, i, XYSCALE, framework)
    else:
      output_tensors = decode(fm, input_size // 32, NUM_CLASS, STRIDES, ANCHORS, i, XYSCALE, framework)
    bbox_tensors.append(output_tensors[0])
    prob_tensors.append(output_tensors[1])
  pred_bbox = tf.concat(bbox_tensors, axis=1)
  pred_prob = tf.concat(prob_tensors, axis=1)
  if framework == 'tflite':
    pred = (pred_bbox, pred_prob)
  else:
    boxes, pred_conf = filter_boxes(pred_bbox, pred_prob, score_threshold=.2, input_shape=tf.constant([input_size, input_size]))
    pred = tf.concat([boxes, pred_conf], axis=-1)
  model = tf.keras.Model(input_layer, pred)
  utils.load_weights(model, weights, 'yolov4', False)
  model.save(output)


save_tf()