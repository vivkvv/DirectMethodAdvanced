import os
import glob
from collections import defaultdict
import xml.etree.ElementTree as ET
from xml.dom import minidom

OLD_XML_BASE_DIR = '.\\directmethod-server\public\data\Sources'
OLD_XML_TRANSLATIONS_DIR = '.\\directmethod-server\public\data\Translations'
OUTPUT_FOLDER = ".\\temp"

def prettify(elem):
    """Возвращает красивое строковое представление XML элемента."""
    rough_string = ET.tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    pretty_string = reparsed.toprettyxml(indent="\t")
    # Удаление лишних пустых строк
    return '\n'.join([line for line in pretty_string.splitlines() if line.strip()])

def transform_all(main_xml_file, translations_xml_file):
    # Ensure the output directories exist
    source_output_dir = os.path.join(OUTPUT_FOLDER, "source")
    translation_output_dir = os.path.join(OUTPUT_FOLDER, "translation")

    os.makedirs(source_output_dir, exist_ok=True)
    os.makedirs(translation_output_dir, exist_ok=True)

    # Парсинг основного XML
    tree = ET.parse(main_xml_file)
    root = tree.getroot()

    # Группировка элементов item по их id
    grouped = defaultdict(list)
    for item in root.findall('item'):
        grouped[item.attrib['id']].append(item)

    # Удаляем все дочерние элементы у root
    for item in root.findall('item'):
        root.remove(item)

    # Вставляем элементы в новой структуре
    for key, items in grouped.items():
        new_parent_item = ET.SubElement(root, 'item', {'id': key})
        for index, child_item in enumerate(items):
            child_item.attrib['id'] = str(index)  # Устанавливаем новый ID
            new_parent_item.append(child_item)

    # Сохраняем основной XML с красивым форматированием и кодировкой UTF-8
    main_filename = os.path.basename(main_xml_file)
    with open(os.path.join(source_output_dir, main_filename), 'w', encoding='utf-8') as f:
        f.write(prettify(root))

    # Парсинг файла с переводами
    trans_tree = ET.parse(translations_xml_file)
    trans_root = trans_tree.getroot()

    # Модификация структуры файла с переводами аналогично основному XML
    trans_grouped = defaultdict(list)
    for item in trans_root.findall('item'):
        trans_grouped[item.attrib['id']].append(item)

    for item in trans_root.findall('item'):
        trans_root.remove(item)

    for key, items in trans_grouped.items():
        new_parent_item = ET.SubElement(trans_root, 'item', {'id': key})
        for index, child_item in enumerate(items):
            child_item.attrib['id'] = str(index)  # Устанавливаем новый ID
            new_parent_item.append(child_item)

    # Сохраняем файл с переводами с красивым форматированием и кодировкой UTF-8
    trans_filename = os.path.basename(translations_xml_file)
    with open(os.path.join(translation_output_dir, trans_filename), 'w', encoding='utf-8') as f:
        f.write(prettify(trans_root))

def find_file_recursive(target_filename):
    root_directory = OLD_XML_TRANSLATIONS_DIR
    for dirpath, dirnames, filenames in os.walk(root_directory):
        if target_filename in filenames:
            return os.path.join(dirpath, target_filename)
    return None

def convert_all():
    good_counter = bad_counter = 0
    items = os.listdir(OLD_XML_BASE_DIR)
    for item in items:
        if(item.startswith('Part')):
            part_path = os.path.join(OLD_XML_BASE_DIR, item)
            part_path_dirs = os.listdir(part_path)
            for lesson_dir in part_path_dirs:
                full_lesson_dir = os.path.join(part_path, lesson_dir)
                if (os.path.isdir(full_lesson_dir) and lesson_dir.startswith('Lesson')):
                    for old_xml_file in glob.glob(os.path.join(full_lesson_dir, '*.xml')):
                        short_name = os.path.basename(old_xml_file)
                        old_translation_xml = find_file_recursive(short_name)
                        if(old_translation_xml is None):
                            print(f"Can't find translation file for {old_xml_file}")
                        else:
                            transform_all(old_xml_file, old_translation_xml)

convert_all()
