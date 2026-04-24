import { IChooseLink, IFile } from '@/types';
import { LinkType, ServiceType } from '@/utils/constants';

export const generatePassword = (): string => {
  const length = 16;
  const charset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567891234567890!@#$%&*?/';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const generateLink = (): string => {
  const length = 8;
  const charset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

let googleAuthToken = '';
let googlePicker: any = null;
export const chooseGoogleDriveLink = (callback: (chooseLink: IChooseLink) => void) => {
  const handleGoogleAuthApiLoad = (): void => {
    window.gapi.auth.authorize(
      {
        'client_id': process.env.NEXT_PUBLIC_GOOGLE_PICKER_CLIENT_ID,
        'scope': process.env.NEXT_PUBLIC_GOOGLE_PICKER_SCOPE_URL,
        'immediate': false
      },
      handleGoogleAuthResult
    );
  };

  const handleGoogleAuthResult = (result: any): void => {
    if (result && !result.error) {
      googleAuthToken = result.access_token;
      
      window.gapi.load('picker', {'callback': createGooglePicker});
    }
  };

  const createGooglePicker = (): void => {
    if (googlePicker === null) {
      const view = new window.google.picker.DocsView().setOwnedByMe(true);  
      //view.setMimeTypes('image/png,image/jpeg,image/jpg');
      googlePicker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(process.env.NEXT_PUBLIC_GOOGLE_PICKER_APP_ID)
        .setOAuthToken(googleAuthToken)
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_PICKER_DEV_KEY)
        .setCallback(googlePickerCallback)
        .build();
      googlePicker.setVisible(true);
    } else {
      googlePicker.setVisible(true);
    }
  };

  const googlePickerCallback = (data: any): void => {
    if (data.action == window.google.picker.Action.PICKED) {
      const doc = data[window.google.picker.Response.DOCUMENTS][0];
      const fileName = doc[window.google.picker.Document.NAME];
      const url = doc[window.google.picker.Document.URL];
          
      const service = ServiceType.GoogleDrive;      
      
      const link = generateLink();
      const password = generatePassword();
      const choseData: IChooseLink = {
        link: link,
        password: password,
        service,
        linkType: LinkType.Single,
        files: [
          {
            name: fileName,
            url: decodeURIComponent(url),
            icon: doc.iconUrl
          }
        ]       
      };

      callback(choseData);
    }  
  };

  if (!googleAuthToken.length) {
    window.gapi.load('auth', {'callback': handleGoogleAuthApiLoad});
  } else {
    window.gapi.load('picker', {'callback': createGooglePicker});
  }

  if (process.env.NODE_ENV === 'development') {
    //Todo: delete this code in production
    window.gapi.load('picker', {'callback': () => {
      const data = {
        action: 'picked',
        docs: [
          {
            'id': '1ylzlHl6-IfFUB09oWQo6Bq-MybMt9v4h',
            'serviceId': 'DoclistBlob',
            'mimeType': 'application/x-msdownload',
            'name': 'Vosk.dll',
            'description': '',
            'type': 'file',
            'lastEditedUtc': 1700049176184,
            'iconUrl': 'https://drive-thirdparty.googleusercontent.com/16/type/application/x-msdownload',
            'url': 'https://drive.google.com/file/d/1ylzlHl6-IfFUB09oWQo6Bq-MybMt9v4h/view?usp=drive_web',
            'embedUrl': 'https://drive.google.com/file/d/1ylzlHl6-IfFUB09oWQo6Bq-MybMt9v4h/preview?usp=drive_web',
            'sizeBytes': 7680,
            'parentId': '0AHezxz2BLAJMUk9PVA',
            'isShared': true
          }
        ],
        viewToken: [
          'all',
          null,
          {
            'ownedByMe': true
          }
        ]
      };
      
      googlePickerCallback(data);
    }});
  }
};

export const chooseDropBoxLink = (callback: (chooseLink: IChooseLink) => void) => {
  const options = {
    success: function(files: any) {
      const link = generateLink();
      const password = generatePassword();
      const service = ServiceType.DropBox;
      const list: IFile[] = [];

      files.forEach((v: any) => {
        list.push({
          url: decodeURIComponent(v.link),
          name: v.name,
          icon: v.icon,
        });
      });

      const chooseLink: IChooseLink = {
        link: link,
        password: password,
        service,
        files: list,
        linkType: LinkType.Multiple
      };

      callback(chooseLink);
    },
    multiselect: true
  };
  window.Dropbox.choose(options);

  if (process.env.NODE_ENV === 'development') {
    // Todo: delete this code in production
    const data = [
      {
        'id': 'id:XTytcsi8nNAAAAAAAAAAkg',
        'name': 'Kelt Dockins (auth.)-Design Patterns in PHP and Laravel-Apress (2017).pdf',
        'bytes': 7234303,
        'isDir': false,
        'link': 'https://www.dropbox.com/scl/fi/htkw8cil58ubh1bogsr4b/Kelt-Dockins-auth.-Design-Patterns-in-PHP-and-Laravel-Apress-2017.pdf?rlkey=mas2goau3q2dp05pbmyf9xdwd&dl=0',
        'linkType': 'preview',
        'icon': 'https://www.dropbox.com/static/images/icons64/page_white_acrobat.png',
        'thumbnails': {
          '640x480': 'https://uc91335c3a53a46ed83e8855e000.previews.dropboxusercontent.com/p/thumb/ACEJAoDTyScdNfoF2wiV7eXtIoXyFw8u6aZ67wl5_w7_yoDyIMHn4q2MRXJ78mlMq1diQQQ_AaDxPuID0i9vmKAyzWBAmiIwY9ndLxvZoXsbvY0iaHvoFFixotMtbqIPv8d1Yt60Vxx53ProYbN5XqT1iqcJByqdMpFLJh_h9zA3gD_TgEEKXuiiJquNU0JyK_7MEoO4TBPg9uVvGmWYl8YWkw96irBSWQV38p2u1C9oxD0DxqzO2w6LTk3ol8DM3kTS8jMUK-mH8JIEqVeWwMFmwHS1DfvkJwWrOSExezRCqf_xRi97WITPZ6q_HX64xtvJm715mwQG3cgLu3fMc18OLMAkR1Eq4Za5m-TyQOdKbj56IJI9qSk3u1abcYPL5iO-Ii-kFP6U5DndQUdkKIvI/p.png',
          '200x200': 'https://uc91335c3a53a46ed83e8855e000.previews.dropboxusercontent.com/p/thumb/ACFmxZhdJ5OIxF3GipOk7gdWbwFOenFNHVpU-tiVhblIUAWYd1CigjRlNWGiiz81WOxIKRxzmZ40lRFOH6lS0mU4PxPCHqZPnSV6mFtvxZc33KjFJ-BrBjifnW2hTBYm4HNIgoy8-Dj1cUzJOw0ygcfAFapcsPXVT7DgBuooelFQWqJL9x9nMJi8gHiJk3y_7K-Mk5D51Irfpts3uV6WopziBQ-9qjC38qD-dkI-8cSl_XR1XTBBue0K8ZjsMF7ChBn-t1CpMs-V4ugwST2sztaw1oQXiBfekNFfVEZORuDe7s4BbV9cgttXs63mKB6pSxVcTlpzLwgRTgun4F7uBopAQ5L3YO_VZH-0yJPAkJfrG_x1mZq_4I-7T1IHoRXQDaI3N9v4O69aAcF2rSqK33mL/p.png',
          '64x64': 'https://uc91335c3a53a46ed83e8855e000.previews.dropboxusercontent.com/p/thumb/ACEY43FKf4ansu7k0m1dQSLM-SJxez6qB5Zu-LTBrJN6Y7H2pg6Mybe-wR9FZRlcoc28L88ilgFDtqB44qnwPTyEiiCUUlINAzhzFukxoUhzWrEs3F2mfPcMKvF_sjs74Im4LfpPXhkDT5xsks67WQjwTfDagmX3rOKPbC5m7gdeH0AIKiIclBvcyLeUAaCeaNtkzre62NxuXSVgxEV4MK9KiTVE76YigK2Z8WQQLxLsNamVclJmA7rlo1QKgNyclGQuDjzOLwMQQK_e59gYRJ_gbzo8tpwlG1M50Dm9X8fI9kj8VE1fGVsAh0U8YFsEr37tME1-1wjUAgkLM160euOOrqPNBIyefnF3jDuw445ARS9mf8STuHkC_UNTUB4P6zmId5wUpoLvM3722hJANB28/p.png'
        }
      },
      {
        'id': 'id:XTytcsi8nNAAAAAAAAAAjw',
        'name': 'Sanjib Sinha (auth.)-Beginning Laravel_ A beginner\'s guide to application development with Laravel 5.3-Apress (2017).pdf',
        'bytes': 2272501,
        'isDir': false,
        'link': 'https://www.dropbox.com/scl/fi/t106p67zuuod56g0n74pz/Sanjib-Sinha-auth.-Beginning-Laravel_-A-beginner-s-guide-to-application-development-with-Laravel-5.3-Apress-2017.pdf?rlkey=o1hvmvlty1grh4vjrtgzl3wt6&dl=0',
        'linkType': 'preview',
        'icon': 'https://www.dropbox.com/static/images/icons64/page_white_acrobat.png',
        'thumbnails': {
          '640x480': 'https://uc18b21e297774cc0a6458b7fc1c.previews.dropboxusercontent.com/p/thumb/ACGMXgZNR2pbjHvjiBbYvG_rfbiBEyECCk6wS40OLINluAQcOblAh1Q5Jip9EKXswrFhYsHMRu_1BkMsYWX6nX8em1erUVd4FHSmyrFr3YIUVf4zG9i-NN6myq16R-JO3HVEmQsC6spawQ1wOJXrJKiSAWXp2KWuyKPi-djmoTHgTGFfvttO5cprRZeFdGE1f_jo8Yc00p3FJpHmz6WZP6qRZ0eCCtHKqzuSSVuQHaRz5uvjW6-jIWl4o0qSfAQW-EJQFLOyh4q4VkJXHrZWppIOgCWKuP62j3Wb_fpoCz7rgE4yPrHQ4H-FedPwO4DQc4oBUPqQw05SDingLdB-OQn8/p.png',
          '200x200': 'https://uc18b21e297774cc0a6458b7fc1c.previews.dropboxusercontent.com/p/thumb/ACHGzfxl_gWIuiheqMcaS-l4k9kzGvtx3pCxzO7jrzWBxYj8s5bLRZYD105myMtaWuuALH0c2bE4kxQBnghvKIvwckoduM-Fk6GmSzNPg55C1JvQf0OcoMsMYFS8SMIkql24Og9uZssyWcpDKk4RQ5iG59RLVKVjgKP5lzI6rURoIQ5bMW-yFqeVeLhsP1bhO_bM-aymWic3_lhxoifmHOaF4-enrWXxDygz-d3UQZj9RZ02Z1sbWB3YFGTCJb5EQznEbWNxn49R2ynXHoRvr82f2VcI3I0sbndhBQx135h6GYdkD9VHjTVju0oEN4IYI4F-AqW-HDdwOqsMPetLvIfS/p.png',
          '64x64': 'https://uc18b21e297774cc0a6458b7fc1c.previews.dropboxusercontent.com/p/thumb/ACFxcH8p6ooWQSl_WBAHqDa4ckJStojfBYhfstULBb-DrUSp5GqTkb8uyqs_duLjK3Rd8v1x3dd4ZjoUxiYZoAgGWBDiszNMj2VBAWkFNKSMitJIQJjQu-3pERRvwyFZfvSCFTg_ewuWZOWQX2uS296PHEH0a6R-uwMSohey6dE0s9jkS-nVSUAf_xVuFasF4IXmtyxVkIhcaE8TOXAa0sxmvccEoQcKbDlOaZIMWtQ_tdMxtPbWtJr7VwBVubLdYh8YFRs1D8G2xqAGkhn8qsPErbVLS45NxhHNTbAWymjgW38zJ_KhzNHeLxOkwmnrU7-4_wPbyEn58mogfnZwfpjg/p.png'
        }
      }
    ];

    setTimeout(() => options.success(data), 100);
  }
};