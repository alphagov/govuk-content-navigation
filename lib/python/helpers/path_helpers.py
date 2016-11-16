import os

def app_directory(sub_path = ""):
    app_dir_path = os.path.join(
      os.path.dirname(os.path.realpath(__file__)),
      "../../../app/",
    )
    return os.path.join(app_dir_path, sub_path)

def lib_directory(sub_path = ""):
    lib_dir_path = os.path.join(
      os.path.dirname(os.path.realpath(__file__)),
      "../../",
    )
    return os.path.join(lib_dir_path, sub_path)
