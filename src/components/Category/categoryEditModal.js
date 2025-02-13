import {
  TextInput,
  Text,
  Grid,
  Button,
  Group,
  ActionIcon,
  ScrollArea,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
import { useMutation, useQuery } from "@apollo/client";
import React, { useState, useRef } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { customLoader } from "components/utilities/loader";
import { UPDATE_CATEGORY } from "apollo/mutuations";
import { GET_CATEGORY } from "apollo/queries";

const CategoryEditModal = ({ setOpenedEdit, editId }) => {
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const form = useForm({
    initialValues: {
      childrens: {
        create: [],
        update: [],
        delete: [],
      },
    },
  });

  const { loading } = useQuery(GET_CATEGORY, {
    variables: { id: editId },
    onCompleted(data) {
      const newUpdateArr = data.category.children.map(
        ({ name_translations: name, ...rest }) => ({
          name,
          ...rest,
        })
      );
      form.setValues({
        id: editId,
        name_translations: {
          am: data.category.name_translations.am,
          en: data.category.name_translations.en,
        },
        image: data.category.imageUrl,
        childrens: {
          create: [],
          update: [...newUpdateArr],
          delete: [],
        },
      });
    },
  });

  const [subCategoryFiles, setSubCategoryFiles] = useState({});
  const [mainCategoryFile, setMainCategoryFile] = useState(null);
  const { height } = useViewportSize();
  const mainFileInputRef = useRef(null);

  const handleMainFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setMainCategoryFile(files[0]);
      form.setFieldValue("image", files[0]);
    }
  };
  const handleSubCategoryImageUpload = (files, type, index) => {
    if (files.length > 0) {
      const file = files[0];
      const key = `${type}-${index}`;
      setSubCategoryFiles((prev) => ({ ...prev, [key]: file }));
      form.setFieldValue(`childrens.${type}.${index}.image`, file);
    }
  };

  const handleFields = () => {
    return (
      <>
        {form.values.childrens?.update?.map((item, index) => (
          <Grid key={`update-${index}`}>
            <Grid.Col span={4}>
              <TextInput
                placeholder="Sub Category"
                required
                label="Sub Category"
                {...form.getInputProps(`childrens.update.${index}.name.en`)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                placeholder="Subcategory (Amharic)"
                style={{ marginTop: "25px" }}
                {...form.getInputProps(`childrens.update.${index}.name.am`)}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                onClick={() => {
                  document.getElementById(`file-input-update-${index}`).click();
                }}
                variant="outline"
                color="blue"
                style={{ marginTop: "25px" }}
                fullWidth
              >
                Upload Image
              </Button>
              <input
                id={`file-input-update-${index}`}
                type="file"
                accept={IMAGE_MIME_TYPE}
                style={{ display: "none" }}
                onChange={(e) =>
                  handleSubCategoryImageUpload(e.target.files, "update", index)
                }
              />
              {/* Updated image display with type-specific key */}
              {subCategoryFiles[`update-${index}`] ? (
                <img
                  src={URL.createObjectURL(subCategoryFiles[`update-${index}`])}
                  width="130"
                  alt="Sub Category"
                />
              ) : (
                item.imageUrl && (
                  <img src={item.imageUrl} width="130" alt="Sub Category" />
                )
              )}
            </Grid.Col>
            <ActionIcon
              color="#ed522f"
              onClick={() => {
                form.removeListItem("childrens.update", index);
                form.insertListItem("childrens.delete", parseInt(item.id));
              }}
              style={{ marginTop: "30px" }}
            >
              <Trash size={24} />
            </ActionIcon>
          </Grid>
        ))}

        {form.values.childrens?.create?.map((item, index) => (
          <Grid key={`create-${index}`}>
            <Grid.Col span={4}>
              <TextInput
                placeholder="New Sub Category"
                required
                label="New Sub Category"
                {...form.getInputProps(`childrens.create.${index}.name.en`)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                placeholder="New Subcategory (Amharic)"
                style={{ marginTop: "25px" }}
                {...form.getInputProps(`childrens.create.${index}.name.am`)}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                onClick={() => {
                  document.getElementById(`file-input-create-${index}`).click();
                }}
                variant="outline"
                color="blue"
                style={{ marginTop: "25px" }}
                fullWidth
              >
                Upload Image
              </Button>
              <input
                id={`file-input-create-${index}`}
                type="file"
                accept={IMAGE_MIME_TYPE}
                style={{ display: "none" }}
                onChange={(e) =>
                  handleSubCategoryImageUpload(e.target.files, "create", index)
                }
              />
              {/* Updated image display with type-specific key */}
              {subCategoryFiles[`create-${index}`] ? (
                <img
                  src={URL.createObjectURL(subCategoryFiles[`create-${index}`])}
                  width="130"
                  alt="New Sub Category"
                />
              ) : null}
            </Grid.Col>
          </Grid>
        ))}
      </>
    );
  };
  const submit = () => {
    const { id, name_translations, childrens } = form.values;

    const cleanChildrenUpdate = childrens.update.map(
      ({ __typename, ...child }, index) => {
        const { name, image } = child; // Get the name and file
        if (subCategoryFiles[index]) {
          return {
            id: child.id,
            name: {
              am: name.am,
              en: name.en,
            },
            image: subCategoryFiles[`update-${index}`] || null, // Use the file object
          };
        } else {
          return {
            id: child.id,
            name: {
              am: name.am,
              en: name.en,
            },
          };
        }
      }
    );
    const childrenCreate = childrens.create.map(({ name }, index) => ({
      name: {
        am: name.am,
        en: name.en,
      },
      image: subCategoryFiles[`create-${index}`] || null,
    }));

    const variables = {
      id,
      name: {
        am: name_translations.am,
        en: name_translations.en,
      },
      children: {
        create: childrenCreate,
        update: cleanChildrenUpdate,
        delete: childrens.delete,
      },
    };
    if (mainCategoryFile) {
      variables.image = form.values.image;
    }
    updateCategory({
      variables,
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Category Edited Successfully",
        });
        form.reset();
        setOpenedEdit(false);
      },
      onError(err) {
        showNotification({
          color: "red",
          title: "Error",
          message: `${err}`,
        });
      },
    });
  };

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <form onSubmit={form.onSubmit(() => submit())} noValidate>
        <Grid>
          <Grid.Col span={4}>
            <TextInput
              required
              label="Category Name (English)"
              placeholder="Enter category name in English"
              {...form.getInputProps("name_translations.en")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              required
              label="Category Name (Amharic)"
              placeholder="Enter category name in Amharic"
              {...form.getInputProps("name_translations.am")}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Button
              onClick={() => mainFileInputRef.current.click()} // Use the main file input ref
              variant="outline"
              color="blue"
              style={{ marginTop: "25px" }}
              fullWidth
            >
              Upload Main Image
            </Button>
            <input
              type="file"
              accept={IMAGE_MIME_TYPE}
              ref={mainFileInputRef}
              style={{ display: "none" }}
              onChange={handleMainFileChange} // Use main file handler
            />
            {/* Display Main Category Image */}
            {mainCategoryFile ? (
              <img
                src={URL.createObjectURL(mainCategoryFile)}
                width="130"
                alt="Main Category"
              />
            ) : (
              <img src={form.values.image} width="130" alt="Main Category" />
            )}
          </Grid.Col>
          <Grid.Col span={12}>
            {handleFields()}
            <Group position="start" mt="md">
              <Button
                color="blue"
                variant="outline"
                fullWidth
                style={{ width: "200px" }}
                onClick={() => {
                  form.insertListItem("childrens.create", {
                    // Insert into "create" array
                    name: { en: "", am: "" },
                    image: null, // Initialize with null or empty value
                  });
                  setSubCategoryFiles((prev) => ({
                    ...prev,
                    [form.values.childrens.create.length]: null, // Ensure it's in the right index
                  }));
                }}
              >
                Add new subcategory
              </Button>
            </Group>
          </Grid.Col>
          <Grid.Col span={4}>
            <Button
              style={{
                width: "25%",
                marginTop: "15px",
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
              type="submit"
              color="blue"
              fullWidth
            >
              Submit
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </ScrollArea>
  );
};

export default CategoryEditModal;
