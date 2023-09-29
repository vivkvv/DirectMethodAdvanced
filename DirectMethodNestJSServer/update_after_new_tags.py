import os
import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom

SOURCE_PATH = '.\\directmethod-server\\public\\data\\Sources\\Part 5\\Lesson 077\\Lesson 077.xml'
TRANSLATION_PATH = '.\\directmethod-server\\public\\data\\Translations\\ru\\Part 5\\Lesson 077\\Lesson 077.xml'
UPDATED_PATH = '.\\updated_temp'

def prettify(xml_string):
    """Возвращает красиво отформатированный XML."""
    parsed = minidom.parseString(xml_string)
    rough_string = parsed.toprettyxml(indent="\t")
    # Удаление лишних пустых строк и пробелов
    lines = [line for line in rough_string.split('\n') if line.strip() != '']
    return '\n'.join(lines)

def renumber_ids(source_file, translation_file, output_dir):
    tree = ET.parse(source_file)
    root = tree.getroot()

    id_map = {}
    current_id = 0
    for child in root:
        if child.tag != "item":
            new_item = ET.Element("item")
            new_item.set("id", str(current_id))
            root.remove(child)

            new_sub_item = ET.Element("item")
            new_sub_item.set("id", "0")
            new_sub_item.set("start", "")
            new_sub_item.set("duration", "")

            new_sub_item.append(child)

            new_item.append(new_sub_item)
            root.insert(current_id, new_item)
            id_map[child.get("id")] = str(current_id)
            current_id += 1
        else:
            id_map[child.get("id")] = str(current_id)
            child.set("id", str(current_id))
            current_id += 1

    if not os.path.exists(f"{output_dir}/source/"):
        os.makedirs(f"{output_dir}/source/")
    with open(f"{output_dir}/source/{os.path.basename(source_file)}", "w", encoding="utf-8") as source_file_out:
        source_file_out.write(prettify(ET.tostring(root, encoding="utf-8").decode()))

    translation_tree = ET.parse(translation_file)
    translation_root = translation_tree.getroot()

    for trans_item in translation_root:
        if trans_item.get("id") in id_map:
            trans_item.set("id", id_map[trans_item.get("id")])

    if not os.path.exists(f"{output_dir}/translation/"):
        os.makedirs(f"{output_dir}/translation/")
    with open(f"{output_dir}/translation/{os.path.basename(translation_file)}", "w", encoding="utf-8") as translation_file_out:
        translation_file_out.write(prettify(ET.tostring(translation_root, encoding="utf-8").decode()))

if __name__ == "__main__":
    renumber_ids(SOURCE_PATH, TRANSLATION_PATH, UPDATED_PATH)
