from actions.action_inference import action_detection, load_model
def action_det(quit_flag,input_queue,out_queue):
    # args,model,device,basetransform,class_names,class_colors = load_model()
    while True:
        if quit_flag.value:
            break
      
        data = input_queue.get()
        if data is None:
            print("I am done action process")
            out_queue.put(data)
            continue

        # action_det = action_detection(frame=data['frame'], outputs=data['head_detection'],model=model,args=args,device=device,basetransform=basetransform,class_names=class_names, class_colors=class_colors)
        data['action_det'] = ''
        out_queue.put(data)