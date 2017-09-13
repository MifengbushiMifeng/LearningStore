/*
  @author Gilles Gerlinger
  Copyright Nokia 2017. All rights reserved.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image, TouchableHighlight, Linking, ScrollView } from 'react-native';
import { Container, Header, Item, Input, Icon, Button, Text } from 'native-base';
import { Left, Body, Right, Title } from 'native-base';
import { Content, List, ListItem, Thumbnail, Drawer, Toast } from 'native-base';

import Carousel  from 'react-native-carousel';
import Accordion from 'react-native-collapsible/Accordion';

import LS from './data';
import SideBar from './sidebar';
import Search from './Search';

var ctx;

export default class Store extends React.Component {

  state = { isLoading:true, width:0 }

  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
    headerTitleStyle: LS.font,
    headerBackTitle: null,
    headerRight: <Icon style={{ marginRight:10 }} name="list" onPress={() => toggleDrawer()}/>
  });

  componentWillMount() {
    ctx = this.props.navigation;
    const { id, url } = ctx.state.params;
    this.store = LS.get(id);
    if (this.store)
      this.setState({ isLoading: false });
    else {
      LS.fetch(id, url + '/img/' + id + '.json.gz', true).then( (store) => { 
        this.store = store;
        this.setState({ isLoading:false }); 
      } );
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    const { carousel, url, homepage, id } = this.props.navigation.state.params;

    const wait = (
      <View style={{ flex:1, flexDirection:'row', paddingTop:20, alignSelf:'center' }}>
        <ActivityIndicator />
        <Text style={ LS.font }>   { LS.loading }</Text>
      </View>
    );

    let homepageData;
    if (this.state.isLoading) 
      homepageData = wait;
    else {
      homepageData = [];
      homepage.forEach((featured, i) => {
        let data = [];
        featured.items.forEach((id) => data.push(this.store.getByID(id)));
        homepageData.push(
          <ScrollView key={i} style={{marginTop:20}}>
            <ListItem itemDivider>
              <Text style={ LS.font }>{ featured.title }</Text>
            </ListItem>
            <List dataArray = { data }
              renderRow = {(item) =>
                <ListItem key={ item.ID } button onPress={() => {
                    navigate('Item', { itemID:item.ID, storeID:item.sid });
                  }}>
                  <Image 
                    style = { LS.icon }
                    resizeMode = 'stretch'
                    source = {{ uri: url + '/' + item.Icon }}
                  />
                  <Body>
                    <Text style={ LS.font }>{ item.Title }</Text>
                  </Body>
                  <Right>
                    <Icon name="arrow-forward"/>
                  </Right>
                </ListItem>
              }>
            </List>
          </ScrollView>
        );
      });
    }
    
    return (
      <Drawer
        ref={(ref) => { ctx.drawer = ref; }}
        content={<SideBar ctx={ ctx }/>}
        onClose={() => closeDrawer()}
        side = 'right' 
      >
        <Header style={{ marginTop:-15, height:55 }} searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input placeholder="Search" style={ LS.font } onChangeText={(text) => {
              this.searchText = text;
            }}/>
          </Item>
          <Button transparent onPress={() => {
            navigate('Search', { id:id, data:LS.filter(id, this.searchText), url:url});
          }}>
            <Text style={ LS.font }>Search</Text>
          </Button>
        </Header>

        <Content padder>
          <View onLayout={(event) => {
            var width = event.nativeEvent.layout.width;
//            console.log('width', width);
            this.setState({ width: width });
          }} >
            <Carousel indicatorSize={25} delay={5000} indicatorOffset={-5} >
            { carousel.map((item, i) => 
              <TouchableHighlight key={i} onPress = {() =>{
                  if (item.id)
                    navigate('Item', { itemID:item.id, storeID:id });
                  else if (item.url)
                    Linking.openURL(item.url);
                  else if (item.text)
                    Toast.show({
                      text: item.text,
                      position: 'top',
                      buttonText: 'OK'
                    });
                  else if (item.html)
                    navigate('Simple', item);
                }} >
                <Image  
                  style = {{ width: this.state.width+18, flex: 1, marginTop:-20, height:(this.state.width)/3 + 40}}
                  resizeMode = 'contain'                  
                  source = {{ uri: url + '/' + item.img }}
                  blurRadius = {0}
                />
              </TouchableHighlight>
            )}
            </Carousel>
          </View>
          { homepageData }
        </Content>
      </Drawer>      
    )
  }
}

toggleDrawer = () => ctx.menuOn ? closeDrawer() : openDrawer();
closeDrawer = () => {
  ctx.drawer._root.close();
  ctx.menuOn = false;
}
openDrawer = () => {
  ctx.drawer._root.open();
  ctx.menuOn = true;
}    

