import {
  TextInput,
  Text,
  Grid,
  Button,
  Tabs,
  Group,
  SimpleGrid,
  ActionIcon,
  ScrollArea,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Photo, Trash } from "tabler-icons-react";
import { useMutation, useQuery } from "@apollo/client";
import React, {  useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { tabList } from "components/utilities/tablist";
import { customLoader } from "components/utilities/loader";
import { UPDATE_CATEGORY } from "apollo/mutuations";
import { GET_CATEGORY } from "apollo/queries";

const CategoryEditModal = ({ getCategory, setOpenedEdit, editId }) => {
  //form initialization and validation
  const form = useForm({});

  // useEffect(() => {
  //   if (editId) {
      
  //   }
  //   // eslint-disable-next-line
  // }, []);

  // mutation
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const {  loading  } =
    useQuery(GET_CATEGORY, {   
        variables: { id: editId },
        onCompleted(data) {
          const newUpdateArr = data.category.children.map(
            ({ name_translations: name, ...rest }) => ({
              name,
              ...rest,
            })
          );
          // newUpdateArr.forEach((obj, index) => {
          //  if("__typename" in obj || "__typename" in obj[index].name ){
          //    delete newUpdateArr[index].__typename;
          //    delete newUpdateArr[index].name.__typename;
          //   // alert("no yet")
          //  }
          //  })
          form.setValues({
            id: editId,
            name_translations: {
              am: data.category.name_translations.am,
              en: data.category.name_translations.en,
            },
            image: data.category.image,
            // children: [...data.category.children],
            childrens: {
              create: [],
              update: [...newUpdateArr],
              delete: [],
            },
          });
        },
    
    });
  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [file, setFile] = useState([]);
  const { height } = useViewportSize();

  //existing sub categories while editing (populated already)
  const handleFields = (value) => {
    let fields = form.values.childrens?.update?.map((item, index) => {
      return (
        <Group key={index} mt="xs">
          <TextInput
            placeholder="Sub Category"
            required
            label="Sub Category"
            sx={{ flex: 1 }}
            {...form.getInputProps(
              value === "am"
                ? `childrens.update.${index}.name.am`
                : `childrens.update.${index}.name.en`
            )}
          />
          <ActionIcon
           color="#ed522f"
            onClick={() => {
              form.removeListItem("childrens.update", index);
              form.insertListItem("childrens.delete", parseInt(item.id));
            }}
            style={{ marginTop: "30px", padding: "2px" }}
          >
            <Trash  size={24} />
          </ActionIcon>
        </Group>
      );
    });

    return fields;
  };

  //new sub categories while editing
  const handleNewFields = (value) => {
    let fields = form.values.childrens?.create?.map((item, index) => {
      return (
        <Group key={item.key} mt="xs">
          <TextInput
            placeholder="Sub Category"
            required
            label="Sub Category (New)"
            sx={{ flex: 1 }}
            {...form.getInputProps(
              value === "am"
                ? `childrens.create.${index}.name.am`
                : `childrens.create.${index}.name.en`
            )}
          />
          <ActionIcon
            color="#ed522f"
            onClick={() => {
              form.removeListItem("childrens.create", index);
            }}
            style={{ marginTop: "30px", padding: "2px" }}
          >
            <Trash  size={24} />
          </ActionIcon>
        </Group>
      );
    });

    return fields;
  };

  // attach uploaded image to ueform image value
  const handleImageUpload = (image) => {
    setFile(image);
    form.setFieldValue("image", image[0]);
  };

  const imagePreview = () => {
    const imageUrl = form.values.image
      ? form.values.image
      : file.length > 0
      ? URL.createObjectURL(file[0])
      : "";
    return (
      <img
        src={imageUrl}
        alt=""
        width="130"
        imageprops={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  };

  const submit = () => {
    form.getInputProps("childrens.update").value.forEach((obj, index) => {
      delete obj.__typename
      delete obj.name.__typename
    });
    // return;
    if (activeTab === tabList[tabList.length - 1].value) {
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

        update(cache, data) {
          // const { categories } = cache.readQuery({ query: GET_CATEGORIES });
        },

        onCompleted() {
          showNotification({
            color: "green",
            title: "Success",
            message: "Category Edited Successfully",
          });
          // refetch();
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
    } else {
      setActiveTab(tabList[tabList.length - 1].value);
    }
  };

  return (
    //mapping the header icon and title
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <Tabs.List>
        {tabList.map((tab, i) => {
          return (
            <Tabs.Tab key={i} value={tab.value} icon={<Photo size={14} />}>
              {tab.name}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          {/* mapping the tablist */}
          {tabList.map((tab, i) => {
            return (
              <Tabs.Panel key={i} value={tab.value} pt="xs">
                <Grid grow>
                  <Grid.Col span={6}>
                    <Grid.Col span={4}>
                      <TextInput
                        required
                        label={tab.label}
                        placeholder={tab.placeHolder}
                        {...form.getInputProps(
                          "name_translations." + tab.shortHand
                        )}
                      />
                      <ScrollArea style={{ height: 300 }}>
                        <div style={{ marginTop: "25px" }}>
                          <Dropzone
                            accept={IMAGE_MIME_TYPE}
                            onDrop={handleImageUpload}
                          >
                            <Group
                              position="center"
                              spacing="xl"
                              style={{ minHeight: 200, pointerEvents: "none" }}
                            >
                              <div>
                                <Text size="xl" inline>
                                  Drag image here or click to select file
                                </Text>
                                <Text size="sm" color="dimmed" inline>
                                  Attach one image for the category
                                </Text>
                              </div>
                            </Group>
                          </Dropzone>

                          <SimpleGrid
                            cols={4}
                            breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                            mt={"xl"}
                          >
                            {/* TODO: center the preview */}
                            <Grid>
                              <Grid.Col span={4}></Grid.Col>
                              <Grid.Col span={4}>{imagePreview()}</Grid.Col>
                              <Grid.Col span={4}></Grid.Col>
                            </Grid>
                          </SimpleGrid>
                        </div>
                      </ScrollArea>
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <Button
                        style={{ display: activeTab === 1 ? "none" : "" }}
                        type="submit"
                        color="blue"
                        variant="outline"
                        fullWidth
                      >
                        Submit
                      </Button>
                    </Grid.Col>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <ScrollArea
                      style={{ height: height / 1.8 }}
                      type="auto"
                      offsetScrollbars
                    >
                      {handleFields(tab.shortHand)?.length > 0 ? (
                        <Group mb="xs"></Group>
                      ) : (
                        <Text color="dimmed" align="center">
                          No sub category Added Yet...
                        </Text>
                      )}

                      {handleFields(tab.shortHand)}
                      {handleNewFields(tab.shortHand)}

                      <Group position="center" mt="md">
                        <Button
                          color="blue"
                          variant="outline"
                          fullWidth
                          onClick={() => {
                            form.insertListItem("childrens.create", {
                              name: { en: "", am: "" },
                            });
                          }}
                        >
                          Add new sub category
                        </Button>
                      </Group>
                    </ScrollArea>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
            );
          })}
        </form>
      </ScrollArea>
    </Tabs>
  );
};

export default CategoryEditModal;
