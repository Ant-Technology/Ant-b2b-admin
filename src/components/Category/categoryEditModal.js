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
  const fileInputRef = useRef(null);

  const handleMainFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setMainCategoryFile(files[0]);
      form.setFieldValue("image", files[0]);
    }
  };

  const handleSubCategoryImageUpload = (files, index) => {
    setSubCategoryFiles((prev) => ({
      ...prev,
      [index]: files[0],
    }));
    form.setFieldValue(`childrens.update.${index}.image`, files[0]);
  };

  const handleFields = () => {
    return form.values.childrens?.update?.map((item, index) => (
      <Grid key={index}>
        <Grid.Col span={4}>
          <TextInput
            placeholder="Sub Category"
            required
            label="Sub Category"
            sx={{ flex: 1 }}
            {...form.getInputProps(`childrens.update.${index}.name.en`)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            placeholder="Subcategory (Amharic)"
            required
            label={`Subcategory ${index + 1} (Amharic)`}
            sx={{ flex: 1 }}
            {...form.getInputProps(`childrens.update.${index}.name.am`)}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Button
            onClick={() => fileInputRef.current.click()} // Trigger file input on button click
            variant="outline"
            color="blue"
            style={{ marginTop: "25px" }}
            fullWidth
          >
            Upload Image
          </Button>
          <input
            type="file"
            accept={IMAGE_MIME_TYPE}
            ref={fileInputRef}
            style={{ display: "none" }} // Hide the file input
            onChange={(e) =>
              handleSubCategoryImageUpload(e.target.files, index)
            } // Handle subcategory image selection
          />
          {subCategoryFiles[index] ? (
            <img
              src={URL.createObjectURL(subCategoryFiles[index])}
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
          style={{ marginTop: "30px", padding: "2px" }}
        >
          <Trash size={24} />
        </ActionIcon>
      </Grid>
    ));
  };

  const submit = () => {
    updateCategory({
      variables: {
        id: form.getInputProps("id").value,
        name: {
          am: form.getInputProps("name_translations.am").value,
          en: form.getInputProps("name_translations.en").value,
        },
        children: {
          create: form.getInputProps("childrens.create").value,
          update: form.getInputProps("childrens.update").value,
          delete: form.getInputProps("childrens.delete").value,
        },
      },
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
              onClick={() => fileInputRef.current.click()} // Trigger file input on button click
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
              ref={fileInputRef}
              style={{ display: "none" }} // Hide the file input
              onChange={handleMainFileChange} // Handle main image selection
            />
            {mainCategoryFile ? (
              <img
                src={URL.createObjectURL(mainCategoryFile)}
                width="130"
                alt="Main Category"
              />
            ) : (
              <img
                src={form.values.image} // Display initial image if it exists
                width="130"
                alt="Main Category"
              />
            )}
          </Grid.Col>
          <Grid.Col span={12}>
            {handleFields()}
            <Group position="start" mt="md">
              <Button
                color="blue"
                variant="outline"
                fullWidth
                style={{ width: "200px" }} // Set a specific width for the button
                onClick={() => {
                  form.insertListItem("childrens.create", {
                    name: { en: "", am: "" },
                    image: "",
                  });
                }}
              >
                Add new sub category
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
