from gazetarget.gazetarget import GazeTarget

def gaze_process(quit_flag,input_queue,out_queue):
    gaze = GazeTarget()
    while True:
        if quit_flag.value:
            break
        data = input_queue.get()
        if data is None:
            print("I am done gaze process")
            out_queue.put(data)
            continue

        gaze_point = gaze.predict_gaze_target(data['head_detection'], data['frame'])
        data['gaze_point'] = gaze_point
        out_queue.put(data)